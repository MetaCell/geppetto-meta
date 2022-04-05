"""
synchronization.py
"""
import time
import threading


import logging
from collections import defaultdict
import ipywidgets as widgets
import json
from traitlets import (CUnicode, Unicode, Instance, List, Dict, Bool, Float, Int)
from jupyter_geppetto import utils

# This is a list of all the models that are synched between Python and Javascript
synched_models = defaultdict(list)
context = None

utils.configure_logging()


def remove_component_sync(componentType, model):
    component_to_remove = None
    for existingModel, synched_component in list(synched_models.items()):
        if existingModel == model:
            component_to_remove = model
            break
    if (component_to_remove):
        synched_models[component_to_remove].disconnect()
        del synched_models[component_to_remove]


class ComponentSync(widgets.Widget):
    '''Defines the synchronization widget'''
    _model_name = Unicode('ComponentSync').tag(sync=True)
    _model_module = Unicode('jupyter_geppetto').tag(sync=True)
    _model_module_version = Unicode('~1.0.0')

    componentType = Unicode('componentType').tag(sync=True)
    model = Unicode('').tag(sync=True)
    id = Unicode('').tag(sync=True)
    value = CUnicode().tag(sync=True)

    widget_name = Unicode('').tag(sync=True)
    embedded = Bool(True).tag(sync=True)
    read_only = Bool(False).tag(sync=True)
    extraData = None

    def __init__(self, **kwargs):
        super(ComponentSync, self).__init__(**kwargs)

        if 'model' in kwargs and kwargs["model"] is not None and kwargs["model"] != '':
            synched_models[kwargs["model"]] = self

        self._value_handler = widgets.CallbackDispatcher()
        # the method updateModel is executed in response to the sync_value event
        self._value_handler.register_callback(self.updateModel)

        self.on_msg(self._handle_component_msg)

    def _handle_component_msg(self, _, content, buffers):
        if content.get('event', '') == 'sync_value':
            self._value_handler(self, content)

    def updateModel(self, *args):
        if self.model != None and self.model != '' and args[1]['value'] != None:
            try:
                value = json.loads(args[1]['value'])
                if isinstance(value, str):
                    value = "'" + value + "'"
                else:
                    value = str(value)
                logging.debug("Updating model with new value " + value)

                object_name = next(iter(context))
                if (object_name and object_name != ""):
                    logging.debug("self.model = " + object_name + "." + self.model)
                    exec(object_name + "." + self.model + "=" + value, context)
                else:
                    logging.debug("self.model = " + self.model)
                    exec(self.model + "=" + value)
            except Exception as identifier:
                logging.exception("Error updating model")

    def connect(self):
        logging.debug("ComponentSync connecting to " + self.model)
        self.send({"type": "connect"})

    def disconnect(self):
        logging.debug("ComponentSync disconnecting from " + self.model)
        self.send({"type": "disconnect"})
        self._value_handler.register_callback(self.updateModel, remove=True)
        self.on_msg(self._handle_component_msg, remove=True)

    def __str__(self):
        return "Component Sync => Widget Name: " + self.widget_name + ", Embedded: " + str(
            self.embedded) + ", Sync Value: " + self.value + ", Model: " + str(
            self.model) + ", Extra Data: " + self.extraData


def startSynchronization(scope):
    timer = LoopTimer(0.3,scope)
    timer.start()
    while not timer.started:
        time.sleep(0.001)

class LoopTimer(threading.Thread):
    """
    a Timer that calls f every interval

    A thread that checks all the variables that we are syncing between Python and Javascript and if
    these variables have changed on the Python side will propagate the changes to Javascript

    """

    def __init__(self, interval, scope, fun=None):
        """
        @param interval: time in seconds between call to fun()
        @param fun: the function to call on timer update
        """
        self.started = False
        self.interval = interval
        self.scope = scope
        if fun == None:
            fun = self.process_events
        self.fun = fun
        threading.Thread.__init__(self)
        self.setDaemon(True)

    def run(self):
        self.started = True
        while True:# from netpyne_ui import neuron_utils
            self.fun()
            time.sleep(self.interval)

    def process_events(self):
        try:
            for model, synched_component in list(synched_models.items()):
                modelValue=None
                if model != '':
                  try:
                      modelValue = eval(model, globals(), self.scope)
                      #logging.debug("Evaluating "+model+" = ")
                      #logging.debug(modelValue)
                      
                  except:
                      pass
                      #logging.debug("Error evaluating "+model+", don't worry, most likely the attribute is not set in the current model")

                if modelValue==None:
                    modelValue=""
                
                synched_component.value = json.dumps(modelValue)

        except Exception as exception:
            logging.exception(
                "Error on Sync Mechanism for non-sim environment thread")
            raise
