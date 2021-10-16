/**
 * Handles incoming messages associated with Simulation
 */
import Resources from "@metacell/geppetto-meta-core/Resources";
import EventManager from '../common/EventManager';
import Manager from '../common/GeppettoManager';

const messageTypes = {
  PROJECT_LOADED: "project_loaded",
  DOWNLOAD_PROJECT : "download_project",
  MODEL_LOADED: "geppetto_model_loaded",
  PROJECT_PROPS_SAVED: "project_props_saved",
  VARIABLE_FETCHED: "variable_fetched",
  IMPORT_TYPE_RESOLVED: "import_type_resolved",
  IMPORT_VALUE_RESOLVED: "import_value_resolved",
  SET_WATCHED_VARIABLES: "set_watched_variables",
  WATCHED_VARIABLES_SET: "watched_variables_set",
  CLEAR_WATCH: "clear_watch",
  GET_MODEL_TREE: "get_model_tree",
  GET_SIMULATION_TREE: "get_simulation_tree",
  SET_PARAMETERS: "set_parameters",
  NO_FEATURE: "no_feature",
  GET_SUPPORTED_OUTPUTS: "get_supported_outputs",
  RESULTS_UPLOADED: "results_uploaded",
  MODEL_UPLOADED: "model_uploaded",
  UPDATE_MODEL_TREE: "update_model_tree",
  DOWNLOAD_MODEL: "download_model",
  DOWNLOAD_RESULTS: "download_results",
  PROJECT_MADE_PUBLIC: "project_made_public",
  FETCHED: "fetched",
};

function MessageHandler (MessageSocket) {

  var messageHandler = {};


  messageHandler[messageTypes.PROJECT_LOADED] = function (payload) {
    var message = JSON.parse(payload.project_loaded);
    MessageSocket.projectId = message.project.id;
    Manager.loadProject(message.project, message.persisted);
  };

  messageHandler[messageTypes.MODEL_LOADED] = function (payload) {
    console.time(Resources.PARSING_MODEL);

    var model = JSON.parse(payload.geppetto_model_loaded);
    Manager.loadModel(model);
  };

  messageHandler[messageTypes.PROJECT_MADE_PUBLIC] = function (payload) {
    var data = JSON.parse(payload.update);
    window.Project.isPublicProject = data.isPublic;
    EventManager.actionsHandler[EventManager.clientActions.PROJECT_MADE_PUBLIC]();
    console.log("Project was made public");
  };

  messageHandler[messageTypes.VARIABLE_FETCHED] = function (payload) {
    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
    var rawModel = JSON.parse(payload.variable_fetched);
    Manager.addVariableToModel(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.STOP_LOGO]();
  };

  messageHandler[messageTypes.FETCHED] = function (payload) {
    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
    var rawModel = JSON.parse(payload.fetched);
    Manager.addVariableToModel(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.STOP_LOGO]();
  };

  messageHandler[messageTypes.IMPORT_TYPE_RESOLVED] = function (payload) {
    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
    var rawModel = JSON.parse(payload.import_type_resolved);
    Manager.swapResolvedType(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.STOP_LOGO]();
  };

  messageHandler[messageTypes.IMPORT_VALUE_RESOLVED] = function (payload) {
    var rawModel = JSON.parse(payload.import_value_resolved);
    Manager.swapResolvedValue(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.STOP_LOGO]();
  };

  messageHandler[messageTypes.PROJECT_PERSISTED] = function (payload) {
    var message = JSON.parse(payload.update);
    var projectID = message.projectID;
    Manager.persistProject(projectID);
    console.log("Project persisted");
    EventManager.actionsHandler[EventManager.clientActions.STOP_PERSIST]();
  };

  messageHandler[messageTypes.PROJECT_CONFIGURATION] = function (payload) {
    EventManager.actionsHandler[EventManager.clientActions.PROJECT_CONFIG_LOADED](payload.configuration);
  };

  messageHandler[messageTypes.WATCHED_VARIABLES_SET] = function (payload) {
    console.log("The list of variables to watch was successfully updated.");
  };


  // received model tree from server
  messageHandler[messageTypes.UPDATE_MODEL_TREE] = function (payload) {
    console.log("The model parameters were successfully updated.");
  };

  // received supported outputs from server
  messageHandler[messageTypes.GET_SUPPORTED_OUTPUTS] = function (payload) {
    var supportedOutputs = JSON.parse(payload.get_supported_outputs);
    console.log(supportedOutputs);
  };

  messageHandler[messageTypes.PROJECT_PROPS_SAVED] = function (payload) {
    console.log("Project saved succesfully");
    EventManager.actionsHandler[EventManager.clientActions.PROJECT_PROPERTIES_SAVED]();
  };

  messageHandler[messageTypes.SET_PARAMETERS] = function (payload) {
    console.log("Set parameters succesfully");
    EventManager.actionsHandler[EventManager.clientActions.PARAMETERS_SET]();
  };

  messageHandler[messageTypes.DOWNLOAD_RESULTS] = function (payload) {
    console.log("Results downloaded succesfully");
  };

  messageHandler[messageTypes.DOWNLOAD_MODEL] = function (payload) {
    console.log("Model downloaded succesfully");
  };

  messageHandler[messageTypes.DOWNLOAD_PROJECT] = function (payload) {
    EventManager.actionsHandler[EventManager.clientActions.PROJECT_DOWNLOADED]();
    console.log("Project downloaded succesfully");
  };

  messageHandler[messageTypes.RESULTS_UPLOADED] = function (payload) {
    console.log("Results uploaded succesfully");
  };

  messageHandler[messageTypes.MODEL_UPLOADED] = function (payload) {
    console.log("Model uploaded succesfully");
  };

  messageHandler.onMessage = function (parsedServerMessage) {
    if (messageHandler[parsedServerMessage.type]) {
      messageHandler[parsedServerMessage.type](JSON.parse(parsedServerMessage.data));
    }
  }

  return messageHandler;

}

// Compatibility with new imports and old require syntax
MessageHandler.default = MessageHandler;
module.exports = MessageHandler;