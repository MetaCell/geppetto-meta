#!/usr/bin/env python3
import json
import traceback
import connexion
import logging

from backend_example import encoder
from pygeppetto.tornado_geppetto.pygeppetto_server import PyGeppettoServer

app = connexion.App(__name__, specification_dir='./openapi/')
app.app.json_encoder = encoder.JSONEncoder

app.add_api('openapi.yaml',
            arguments={'title': 'backend-example'},
            pythonic_params=True)

gapp = PyGeppettoServer(app)


@app.app.errorhandler(Exception)
def handle_exception(e: Exception):
    data = {
        "description": str(e),
        "type": type(e).__name__,
        'trace': traceback.format_exc()
    }
    logging.error("Uncaught server error", exc_info=True)

    return json.dumps(data), 500


def main():
    gapp.run()


if __name__ == '__main__':
    main()
