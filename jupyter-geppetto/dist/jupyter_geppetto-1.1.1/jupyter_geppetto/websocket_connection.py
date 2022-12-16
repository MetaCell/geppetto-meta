"""
Class used to process Web Socket Connections. Messages sent from the connecting clients, web socket connections,
are received in here.
"""
from __future__ import print_function

import gzip
import json
import logging
import time

from jupyter_geppetto import settings
from pyecore.ecore import EList
from pygeppetto.api.inbound_messages import InboundMessages
from pygeppetto.api.message_handler import GeppettoMessageHandler
from pygeppetto.managers import GeppettoManager
from tornado.websocket import WebSocketHandler

MANAGERS_HANGING_TIME_SECONDS = 60 * 5


class TornadoGeppettoWebSocketHandler(WebSocketHandler, GeppettoMessageHandler):
    hanging_managers = {}
    def open(self):
        # 1 -> Send the connection
        logging.info('Open websocket')

        self.sendClientId()

        # 2 -> Check user privileges
        self.sendPrivileges()
        
    def send_message_data(self, msg_data):
        msg = json.dumps(msg_data)
        if settings.websocket.compression_enabled and len(msg) > settings.websocket.min_message_length_for_compression:
            self.write_message(gzip.compress(bytes(msg, 'utf-8')), binary=True)
        else:
            self.write_message(msg)

    def handle_message(self, payload):
        msg_type = self.get_message_type(payload)
        if msg_type == InboundMessages.RECONNECT:
            connection_id = json.loads(payload['data'])['connectionID']
            self.recover_manager(connection_id)
        super().handle_message(payload)

    def on_message(self, message):
        self.handle_message(json.loads(message))

    def on_close(self):
        self.cleanup_manager(self.scope_id)
        logging.info("Closed Connection ...")

    def convertRunnableQueriesDataTransferModel(self, runnableQueries):
        """ generated source for method convertRunnableQueriesDataTransferModel """
        runnableQueriesEMF = EList('')
        from pygeppetto.model.datasources.datasources import RunnableQuery
        for dt in runnableQueries:
            rqEMF = RunnableQuery(targetVariablePath=dt.targetVariablePath, queryPath=dt.queryPath)
            runnableQueriesEMF.append(rqEMF)
        return runnableQueriesEMF

    def recover_manager(self, connection_id):
        if GeppettoManager.has_instance(connection_id):
            self.geppettoManager = GeppettoManager.replace_instance(connection_id, self.scope_id)

    @classmethod
    def cleanup_manager(cls, client_id):

        from threading import Thread

        def clean_up():
            time.sleep(MANAGERS_HANGING_TIME_SECONDS)

            GeppettoManager.cleanup_instance(client_id)

        Thread(target=clean_up).start()
