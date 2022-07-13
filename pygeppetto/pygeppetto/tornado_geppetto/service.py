import json
import logging
import os
import glob

pygeppetto_conf_file = 'PyGeppettoConfiguration.json'


class PathService:
    webapp_directory = os.path.abspath(".") + '/webapp/'
    template_path = 'build/geppetto.vm'

    @classmethod
    def get_webapp_directory(cls):
        if not os.path.exists(cls.webapp_directory):
            discovered_paths = glob.glob(os.path.abspath(".") + '/**/' + pygeppetto_conf_file, recursive=True)
            if discovered_paths:
                f = open(discovered_paths[0])
                webapp_directory = json.load(f).get('webapp_directory', None)
                f.close()
                if webapp_directory:
                    cls.webapp_directory = os.path.join(os.path.abspath("."), webapp_directory)
                    logging.info('Webapp directory discovered: {}'.format(cls.webapp_directory))
                    return cls.webapp_directory
            logging.error('Cannot determine webapp directory. PathService won\'t work')
        return cls.webapp_directory


    @classmethod
    def get_template_path(cls):
        if not os.path.exists(os.path.join(cls.get_webapp_directory(), cls.template_path)):
            discovered_paths = glob.glob(os.path.abspath(".") + '/**/' + pygeppetto_conf_file, recursive=True)
            if discovered_paths:
                f = open(discovered_paths[0])
                template_path = json.load(f).get('template_path', None)
                f.close()
                if template_path:
                    cls.template_path = os.path.join(cls.get_webapp_directory(), template_path)
        return cls.template_path
