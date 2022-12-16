'''
Settings for the module. Change right after importing, if needed.
'''

# The path of the geppetto client. Relative path is from the application root
geppetto_webapp_file = 'GeppettoConfiguration.json'

# The path of the template. It should be relative to the webapp path
template_path = 'build/geppetto.vm'
# The path of the Jupyter notebook file
notebook_path = 'notebook.ipynb'
# Server host pattern
host_pattern = '.*$'

webapp_root_paths = ['/geppetto']

home_page = '/geppetto'

geppetto_servlet_path_name = 'GeppettoServlet'


debug = False


class websocket:
    compression_enabled = False
    min_message_length_for_compression = 200


