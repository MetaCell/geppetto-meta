import json
import logging
import os
import time
import typing
from types import TracebackType
from typing import List, Tuple, Optional, Callable, Any, Dict

import tornado.concurrent
import tornado.options
import tornado.web
import tornado.wsgi
from tornado import escape, httputil
from tornado.ioloop import IOLoop
from tornado.routing import Matcher
from tornado.web import Application, StaticFileHandler, RedirectHandler
from tornado.websocket import WebSocketHandler
from tornado.wsgi import WSGIContainer

if typing.TYPE_CHECKING:
    from typing import Type  # noqa: F401
    from wsgiref.types import WSGIApplication as WSGIAppType  # noqa: F401

from pyecore.ecore import EList
from pygeppetto.api.inbound_messages import InboundMessages
from pygeppetto.api.message_handler import GeppettoMessageHandler
from pygeppetto.managers import GeppettoManager

from .settings import host_pattern, webapp_static_paths, home_page, \
    geppetto_servlet_path_name, debug

from .webapi import RouteManager
from .handlers import GeppettoController
from .service import PathService

from werkzeug.routing import Map, Rule

MANAGERS_HANGING_TIME_SECONDS = 60 * 5


def _add_routes(web_app: Application, routes, host_pattern='.*$', base_path='/'):
    logging.info('Adding routes starting at base path {}'.format(base_path))
    for route in routes:
        logging.info('Adding http route {}'.format(route.path))
        route_path = os.path.join(base_path, route.path)
        logging.info('Complete route url: {}'.format(route_path))
        web_app.add_handlers(host_pattern, [(route_path, route.handler)])
        if route_path[-1] != '/':
            web_app.add_handlers(host_pattern, [(route_path + '/', route.handler)])
        else:
            web_app.add_handlers(host_pattern, [(route_path[0:-1], route.handler)])


def _add_static_routes(web_app, host_pattern='.*$', base_path='/'):
    logging.info('Adding routes starting at base path {}'.format(base_path))

    for webapp_root_path in webapp_static_paths:
        logging.info('Adding static http route {} pointing at'.format(webapp_root_path))
        route_path = os.path.join(base_path, webapp_root_path['web'], '(.*)')
        logging.info('Complete route url: {}'.format(route_path))
        web_app.add_handlers(host_pattern, [(route_path, StaticFileHandler, {"path": webapp_root_path['root']})])


def init_routes(web_app: Application, base_path):
    _add_routes(web_app, RouteManager.routes, host_pattern, base_path)
    _add_static_routes(web_app, host_pattern, base_path)


class GeppettoServletMatcher(Matcher):

    def match(self, request):
        if geppetto_servlet_path_name == request.path[-len(geppetto_servlet_path_name):]:
            return {}


class BasePathRecognitionMatcher(Matcher):
    """ Allows adding routes dynamically starting to the first call to /geppetto.

    Starts as a catch-all then turns off after all the routes are added.
    """

    def __init__(self, tornado_app: Application):
        self.paths = []
        self.tornado_app = tornado_app

    def match(self, request):
        path = request.path
        logging.debug('Trying to match path: {}'.format(path))

        if home_page not in path:
            return None  # We activate the path initialization only for the first home call

        base_path = path.split(home_page)[0]
        if not base_path or base_path[0] != '/':
            base_path = '/' + base_path

        logging.debug('Path found: {}'.format(base_path))
        if base_path in self.paths:
            return None  # Skip already added base path

        self.paths.append(base_path)
        logging.info('New context path found: {}. Relative routes will be added.'.format(base_path))
        init_routes(self.tornado_app, base_path)
        return {}


class RetryHandler(tornado.web.RequestHandler):

    def get(self):
        self.redirect(self.request.path)


class TornadoGeppettoWebSocketHandler(WebSocketHandler, GeppettoMessageHandler):
    """ Handles websocket messages and connections. """

    hanging_managers = {}

    def check_origin(self, origin):
        return True

    def open(self):
        logging.info('Open websocket')
        self.sendClientId()
        self.sendPrivileges()

    def send_message_data(self, msg_data):
        msg = json.dumps(msg_data)
        self.write_message(msg)

    def handle_message(self, payload):
        msg_type = self.get_message_type(payload)
        if msg_type == InboundMessages.RECONNECT:
            connection_id = json.loads(payload['data'])['connectionID']
            self.recover_manager(connection_id)
        super().handle_message(payload)

    def on_message(self, message):
        self.handle_message(json.loads(message))

    def on_close(self):
        self.cleanup_manager(self.scope_id)
        logging.info("Closed Connection ...")

    def convertRunnableQueriesDataTransferModel(self, runnableQueries):
        """ generated source for method convertRunnableQueriesDataTransferModel """
        runnableQueriesEMF = EList('')
        from pygeppetto.model.datasources.datasources import RunnableQuery
        for dt in runnableQueries:
            rqEMF = RunnableQuery(targetVariablePath=dt.targetVariablePath, queryPath=dt.queryPath)
            runnableQueriesEMF.append(rqEMF)
        return runnableQueriesEMF

    def recover_manager(self, connection_id):
        if GeppettoManager.has_instance(connection_id):
            self.geppettoManager = GeppettoManager.replace_instance(connection_id, self.scope_id)

    @classmethod
    def cleanup_manager(cls, client_id):

        from threading import Thread

        def clean_up():
            time.sleep(MANAGERS_HANGING_TIME_SECONDS)

            GeppettoManager.cleanup_instance(client_id)

        Thread(target=clean_up).start()


class ConnexionRuleMatcher(Matcher):

    def __init__(self, rule: Rule):
        self.rule = rule

    def match(self, request):
        # Rules coming from connexion use a regex like "^\\|". Patching the request path to match with that
        path = '|' + request.path
        if (self.rule.match(path)) is not None:
            return {}
        return None


def WSGIAsyncHandler(rule: Rule, app: "WSGIAppType"):
    """ Enables asynchronous request handling of an originally synchronous WSGI app. """

    class Handler(tornado.web.RequestHandler):
        r = rule
        wsgi_application = app

        def execute(self, callback):
            import threading

            def run():
                # return callback(self.a.view_functions[self.r.endpoint].__wrapped__(self.request))

                request = self.request
                data = {}  # type: Dict[str, Any]
                response = []  # type: List[bytes]

                def start_response(
                        status: str,
                        headers: List[Tuple[str, str]],
                        exc_info: Optional[
                            Tuple[
                                "Optional[Type[BaseException]]",
                                Optional[BaseException],
                                Optional[TracebackType],
                            ]
                        ] = None,
                ) -> Callable[[bytes], Any]:
                    data["status"] = status
                    data["headers"] = headers
                    return response.append

                app_response = self.wsgi_application(
                    WSGIContainer.environ(request), start_response
                )
                try:
                    response.extend(app_response)
                    body = b"".join(response)
                finally:
                    if hasattr(app_response, "close"):
                        app_response.close()  # type: ignore
                if not data:
                    raise Exception("WSGI app did not call start_response")

                status_code_str, reason = data["status"].split(" ", 1)
                status_code = int(status_code_str)
                self.set_status(status_code=status_code, reason=reason)
                headers = data["headers"]  # type: List[Tuple[str, str]]
                header_set = set(k.lower() for (k, v) in headers)
                body = escape.utf8(body)
                if status_code != 304:
                    if "content-length" not in header_set:
                        headers.append(("Content-Length", str(len(body))))
                    if "content-type" not in header_set:
                        headers.append(("Content-Type", "text/html; charset=UTF-8"))
                if "server" not in header_set:
                    headers.append(("Server", "TornadoServer/%s" % tornado.version))

                start_line = httputil.ResponseStartLine("HTTP/1.1", status_code, reason)
                header_obj = httputil.HTTPHeaders()
                for key, value in headers:
                    self.set_header(key, value)

                callback(response[0])

            threading.Thread(target=run).start()

        async def handle(self):
            f = tornado.concurrent.Future()
            self.execute(f.set_result)
            self.write(await f)

        if 'GET' in rule.methods:
            get = handle

        if 'POST' in rule.methods:
            post = handle

    return Handler


# We're adding here the base routes: or maybe it should be the application to add all the routes it needs

class PyGeppettoServer:
    """ The main Python server running a Geppetto based application.

        * Serves frontend files
        * Handles websocket connections
        * Publishes a REST API.
    """

    def __init__(self, app=None):
        """ Assigns the app and configures the :class:`RouteManager`.

        :param app: app to serve
        """
        self.app = app

        RouteManager.add_controller(GeppettoController)
        RouteManager.add_web_client(PathService.get_webapp_directory())
        RouteManager.add_web_client("/home/user")

    def sockets(self, handlers):
        self.socket_handlers = handlers

    def run(self, port=8888, host='127.0.0.1', **kwargs):
        """ Entry method to start the server listening at `port` as `host`.

        :param port: port to listen to, default of 8888
        :param host: optional host
        :param kwargs: optional keyword arguments
        """
        tornado.options.parse_command_line()
        tornado_app = Application(
            [
                (r'/org.geppetto.frontend/GeppettoServlet', TornadoGeppettoWebSocketHandler),
                (r"/", RedirectHandler, {"url": "/geppetto", "permanent": False})
            ],
            debug=True,
            compress_response=True
        )
        RouteManager.init_tornado_app(tornado_app)
        rules_map: Map = self.app.app.url_map
        for route in rules_map.iter_rules():
            if '/api' == route.rule[0:4]:
                tornado_app.add_handlers(host_pattern,
                                         [(ConnexionRuleMatcher(route), WSGIAsyncHandler(route, self.app.app))])

        tornado_app.add_handlers(host_pattern, [(BasePathRecognitionMatcher(tornado_app), RetryHandler)])
        tornado_app.add_handlers(host_pattern, [(GeppettoServletMatcher(), TornadoGeppettoWebSocketHandler)])
        tornado_app.add_handlers(host_pattern, [('/admin', tornado.web.RedirectHandler, {
            "url": '//' + os.getenv('CURATION_DOMAIN', 'localhost:1337') + '/admin'})])

        tornado_app.listen(port)
        IOLoop.instance().start()


def initapp(nbapp):
    try:
        nbapp.log.info("Starting Geppetto Jupyter extension")

        if debug:
            nbapp.log_level = 'DEBUG'
        RouteManager.init_tornado_app(nbapp)

        # Just add the wildcard matcher here. Other routes will be added dynamically from within the matcher.
        nbapp.web_app.add_handlers(host_pattern, [(BasePathRecognitionMatcher(nbapp), RetryHandler)])
        nbapp.web_app.add_handlers(host_pattern, [(GeppettoServletMatcher(), TornadoGeppettoWebSocketHandler)])
        # init_routes(nbapp, '/')

        nbapp.log.info("Geppetto Jupyter extension is running!")
        RouteManager.add_controller(GeppettoController)
    except Exception:
        nbapp.log.error('Error on Geppetto Server extension')
        raise


