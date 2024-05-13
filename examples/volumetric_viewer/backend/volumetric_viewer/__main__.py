#!/usr/bin/env python3

import connexion

from volumetric_viewer import encoder



def main():
    app = connexion.App(__name__, specification_dir='./openapi/', server_args={'static_folder': './static/'})
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api('openapi.yaml',
                arguments={'title': 'volumetric_viewer'},
                pythonic_params=True)
    app.run(port=8080)


if __name__ == '__main__':
    main()
