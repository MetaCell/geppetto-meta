import logging
import sys

from ipykernel.jsonutil import json_clean
# from jupyter_client import session
from zmq.utils import jsonapi


def convertToJS(content):
    # return session.json_packer(content).decode("utf-8")
    # Old way: this needs to be deleted if the above line is enough
    return jsonapi.dumps(json_clean(content), default=str).decode("utf-8")


def convertToPython(content):
    # return session.json_unpacker(content)
    # Old way: this needs to be deleted if the above line is enough
    return jsonapi.loads(content)


def exception_to_string(exc_info):
    import IPython.core.ultratb
    tb = IPython.core.ultratb.VerboseTB()
    return tb.text(*exc_info)


def getJSONError(message, exc_info):
    data = {}
    data['type'] = 'ERROR'
    data['websocket'] = message

    if isinstance(exc_info, str):
        details = exc_info
    else:
        details = exception_to_string(exc_info)
    data['details'] = details
    return data


def getJSONReply():
    data = {}
    data['type'] = 'OK'
    return data


def configure_logging():
    try:
        # Configure log
        logger = logging.getLogger()
        fhandler = logging.FileHandler(filename='app.log', mode='a')
        formatter = logging.Formatter('%(asctime)s|%(name)s|%(levelname)s - %(message)s')
        fhandler.setFormatter(formatter)
        logger.addHandler(fhandler)
        logger.addHandler(logging.StreamHandler(sys.stdout))
        logger.setLevel(logging.DEBUG)
        logging.debug('Log configured')
    except Exception as exception:
        logging.exception("Unexpected error while initializing Geppetto from Python:")
        logging.error(exception)


def createNotebook(filename):
    import nbformat as nbf
    from nbformat.v4.nbbase import new_notebook
    import codecs
    nb0 = new_notebook(cells=[], metadata={"kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
    }})
    f = codecs.open(filename, encoding='utf-8', mode='w')
    nbf.write(nb0, f, 4)
    f.close()
