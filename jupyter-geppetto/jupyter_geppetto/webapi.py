'''
Define decorators to easily define action controllers

'''
from notebook.base.handlers import IPythonHandler
from tornado.web import RequestHandler, StaticFileHandler
import logging
from jupyter_geppetto import utils


import sys


def export(fn):
    '''Decorator to add to the __all__ variable'''
    mod = sys.modules[fn.__module__]
    if not hasattr(mod, '__all__'):
        mod.__all__ = []
    mod.__all__.append(fn.__name__)
    return fn


class METHODS:
    GET = 'get'
    POST = 'post'
    PUT = 'put'
    DELETE = 'delete'


class Route:
    def __init__(self, path, handler):
        self.path = path
        self.handler = handler


@export
class RouteManager:
    '''Gives an access point to define routes and relates controllers/handlers'''
    routes = []
    static = []

    @classmethod
    def initNotebookApp(cls, nbapp):
        cls.nbapp = nbapp

    @classmethod
    def add_routes(cls, routes):
        cls.routes += routes

    @classmethod
    def add_route(cls, path, handler):
        cls.routes.append(Route(path, handler))

    @classmethod
    def add_controller(cls, controller_class):
        '''A controller is a class which defined the actions as methods decorated with tornado_action decorators
        (get, post, or custom)'''
        cls.routes += [c for c in controller_class.__dict__.values() if type(c) == Route]

    @classmethod
    def add_web_client(cls, files_path):
        cls.static.append(files_path)


class HandlerType(type):
    '''Just a recognizable metaclass'''
    pass


def tornado_action(method, path, headers={}):
    '''Annotation to build a tornado web handler on a function or method'''

    assert method in (getattr(METHODS, m) for m in dir(METHODS)), \
        'Method {} not allowed. Should be one of {}'.format(
            method, tuple(getattr(METHODS, m) for m in dir(METHODS) if not '_' in m))

    def real_decorator(fn):
        def handlerFn(self, *args):
            logging.info('Calling {}'.format(fn.__name__))
            function_arguments = fn.__code__.co_varnames
            kwargs = {name: self.get_query_argument(name)
                      for name in function_arguments[len(args) + 1:]
                      if self.get_query_argument(name, None) != None
                      }
            kwargs.update({name: self.get_body_argument(name)
                           for name in function_arguments[len(args) + 1:]
                           if self.get_body_argument(name, None) != None
                           })
            logging.debug('Positional arguments: {}'.format(args))
            logging.debug('Keyword arguments: {}'.format(kwargs))
            value = fn(self, *args, **kwargs)

            for hname, hvalue in headers.items():
                self.set_header(hname, hvalue)
            if value is not None:
                self.finish(value)

        route = Route(path, HandlerType(path, (IPythonHandler,), {method: handlerFn}))
        return route

    return real_decorator


@export
def get(path, headers={}):
    '''Annotation for get actions.
    Parameters are taken first from the path wildcard pieces (.*), then from the query string. Query string parameters
    must have the same name of decorated function arguments.
    '''
    return tornado_action(METHODS.GET, path, headers)


@export
def post(path, headers={}):
    '''Annotation for post actions'''
    return tornado_action(METHODS.POST, path, headers)


if __name__ == '__main__':
    class TestController:

        @get('/test')
        def foo(self, arg, argument=1):
            return '{} {} {}'.format('foo', arg, argument)


    print(TestController.foo.path, TestController.foo.handler)


    class MockApplication:
        ui_methods = {}
        ui_modules = {}
        settings = {}

        def log_request(self, *args):
            pass


    class MockConnection:
        def set_close_callback(self, *args):
            return 0

        def write(self, something, callback=None):
            print('write')
            print(something)

        def finish(self, *args, **kwargs):
            print('finish')

        def write_headers(self, *args, **kwargs):
            print('write_headers')


    class MockRequest:
        connection = MockConnection()
        query_arguments = {'argument': ['2']}
        method = 'GET'
        headers = {}
        uri = ''
        remote_ip = ''


    print("\n\nTest auto created handler")
    handler = TestController.foo.handler(MockApplication(), MockRequest())
    handler._execute([])
    handler._finished = False
    handler.get(1)

    print("\n\nTest standard handler")


    class EquivalentHandler(RequestHandler):
        def get(self, arg):
            self.finish('{} {} {}'.format('foo', arg, self.get_query_argument('argument')))


    handler = EquivalentHandler(MockApplication(), MockRequest())
    handler._execute([])
    handler._finished = False
    handler.get(1)
