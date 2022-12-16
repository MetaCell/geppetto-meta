import logging
import os.path

import tornado.web
from jupyter_geppetto.handlers import GeppettoController
from jupyter_geppetto.service import PathService
from jupyter_geppetto.settings import host_pattern, notebook_path, webapp_root_paths, home_page, \
    geppetto_servlet_path_name
from jupyter_geppetto.utils import createNotebook
from jupyter_geppetto.webapi import RouteManager
from jupyter_geppetto.websocket_connection import TornadoGeppettoWebSocketHandler
from notebook.utils import url_path_join
from tornado.routing import Matcher
from tornado.web import StaticFileHandler


# @deprecated Backward compatibility: remove when every application stop using
import jupyter_geppetto.synchronization as jupyter_geppetto

def _jupyter_server_extension_paths():
    return [{
        "module": "jupyter_geppetto"
    }]


def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        # the path is relative to the `jupyter_geppetto` directory
        src="",
        # directory in the `nbextension/` namespace
        dest="jupyter_geppetto",
        # _also_ in the `nbextension/` namespace
        require="jupyter_geppetto/index")]


def _add_routes(nbapp, routes, host_pattern='.*$', base_path='/'):
    nbapp.log.info('Adding routes starting at base path {}'.format(base_path))
    for route in routes:
        nbapp.log.info('Adding http route {}'.format(route.path))
        route_path = url_path_join(base_path, route.path)
        nbapp.log.info('Complete route url: {}'.format(route_path))
        nbapp.web_app.add_handlers(host_pattern, [(route_path, route.handler)])
        if route_path[-1] != '/':
            nbapp.web_app.add_handlers(host_pattern, [(route_path + '/', route.handler)])
        else:
            nbapp.web_app.add_handlers(host_pattern, [(route_path[0:-1], route.handler)])


def _add_static_routes(nbapp, static_paths, host_pattern='.*$', base_path='/'):
    nbapp.log.info('Adding routes starting at base path {}'.format(base_path))
    for static_path in static_paths:
        nbapp.log.info('Adding static http route {} pointing at'.format(static_path))
        for webapp_root_path in webapp_root_paths:
            route_path = url_path_join(base_path, webapp_root_path, '(.*)')
            nbapp.log.info('Complete route url: {}'.format(route_path))
            nbapp.web_app.add_handlers(host_pattern, [(route_path, StaticFileHandler, {"path": static_path})])


def init_routes(nbapp, base_path):
    web_app = nbapp.web_app
    config = web_app.settings['config']
    if 'library' in config:
        modules = config['library'].split(',')
        for moduleName in modules:
            nbapp.log.info('Initializing library module {}'.format(moduleName))
            module = __import__(moduleName)  # Here the module should add its routes to the RouteManager

    _add_routes(nbapp, RouteManager.routes, host_pattern, base_path)
    _add_static_routes(nbapp, RouteManager.static, host_pattern, base_path)

class GeppettoServletMatcher(Matcher):

    def match(self, request):
        if geppetto_servlet_path_name == request.path[-len(geppetto_servlet_path_name):]:
            return {}


class BasePathRecognitionMatcher(Matcher):
    '''Allows adding routes dynamically starting to the first call to /geppetto.
    Starts as a catch-all then turns off after all the routes are added.'''

    def __init__(self, nbapp):
        self.paths = []
        self.nbapp = nbapp

    def match(self, request):
        path = request.path
        self.nbapp.log.debug('Trying to match path: {}'.format(path))

        if home_page not in path:
            return None  # We activate the path initialization only for the first home call

        base_path = path.split(home_page)[0]
        if not base_path or base_path[0] != '/':
            base_path = '/' + base_path

        self.nbapp.log.debug('Path found: {}'.format(base_path))
        if base_path in self.paths:
            return None  # Skip already added base path

        self.paths.append(base_path)
        self.nbapp.log.info('New context path found: {}. Relative routes will be added.'.format(base_path))
        init_routes(self.nbapp, base_path)
        return {}


class RetryHandler(tornado.web.RequestHandler):

    def get(self):
        self.redirect(self.request.path)


def load_jupyter_server_extension(nbapp):
    try:
        nbapp.log.info("Starting Geppetto Jupyter extension")
        logging.info = nbapp.log.info
        logging.debug = nbapp.log.debug
        logging.error = nbapp.log.error

        if settings.debug:
            nbapp.log_level = 'DEBUG'
        RouteManager.initNotebookApp(nbapp)

        if not os.path.exists(notebook_path):
            nbapp.log.info("Creating notebook {}".format(notebook_path))
            createNotebook(notebook_path)
        else:
            nbapp.log.info("Using notebook {}".format(notebook_path))

        # Just add the wildcard matcher here. Other routes will be added dinamically from within the matcher.
        nbapp.web_app.add_handlers(host_pattern, [(BasePathRecognitionMatcher(nbapp), RetryHandler)])
        nbapp.web_app.add_handlers(host_pattern, [(GeppettoServletMatcher(), TornadoGeppettoWebSocketHandler)])
        # init_routes(nbapp, '/')

        nbapp.log.info("Geppetto Jupyter extension is running!")

    except Exception:
        nbapp.log.error('Error on Geppetto Server extension')
        raise

# We're adding here the base routes: or maybe it should be the application to add all the routes it needs
RouteManager.add_controller(GeppettoController)
RouteManager.add_web_client(PathService.get_webapp_directory())