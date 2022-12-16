import logging

from jupyter_geppetto.service import PathService

from .settings import template_path, home_page
from .webapi import get


class GeppettoController:

    @get('/geppettoprojects')
    def getProjects(self, **kwargs):
        # TODO still no project handling here.
        return {}

    @get(home_page)
    def index(self, **kwargs):
        try:
            template = template_path
            return open(PathService.get_webapp_resource(template)).read()
        except Exception:
            logging.info('Error on Geppetto Server extension')
            raise
