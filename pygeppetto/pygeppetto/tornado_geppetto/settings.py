"""
Settings for the module. Change right after importing, if needed.
"""
from .service import PathService

webapp_static_paths = [{'web': '/', 'root': PathService.get_webapp_directory()}, ]
# The path of the Jupyter notebook file
notebook_path = 'notebook.ipynb'
# Server host pattern
host_pattern = '.*$'

home_page = '/geppetto'

geppetto_servlet_path_name = 'GeppettoServlet'

debug = False


class websocket:
    compression_enabled = False
    min_message_length_for_compression = 200
