import logging

from .service import PathService
from .settings import home_page
from .webapi import get


class GeppettoController:

    @get('/geppettoprojects')
    def getProjects(self, **kwargs):
        return {}

    @get(home_page)
    def index(self, **kwargs):
        try:
            return open(PathService.get_template_path()).read()
        except Exception:
            logging.info('Error on Geppetto Server extension')
            raise
