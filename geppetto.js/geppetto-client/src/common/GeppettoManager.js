/**
 * Client class use to handle Geppetto workflows
 *
 * @module Manager
 * @author Matteo Cantarelli
 */

import EventManager from './EventManager';
import MessageSocket from '../communication/MessageSocket';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import Resources from '@metacell/geppetto-meta-core/Resources';
import Instances from '@metacell/geppetto-meta-core/Instances';
import ModelManager from '@metacell/geppetto-meta-core/ModelManager';

export default function Manager (options) {

}

/**
 * @depreacted
 */
Manager.prototype = {

  constructor: Manager,

  /**
   *
   * @param payload
   */
  persistProject: function (projectID) {
    window.Project.id = parseInt(projectID);
    window.Project.persisted = true;
    window.Project.readOnly = false;

    EventManager.actionsHandler[EventManager.clientActions.PROJECT_PERSISTED]();
  },

  /**
   *
   * @param payload
   */
  loadProject: function (project, persisted) {
    // we remove anything from any previous loaded project if there was one
    EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](Resources.LOADING_PROJECT);
    if (Project) {
      Project.initialize();
    }
 

    window.Project = project;
    window.Project.readOnly = !persisted;

    EventManager.actionsHandler[EventManager.clientActions.PROJECT_LOADED]();
  },

  /**
   *
   * @param payload
   */
  loadModel: function (model) {
    
    EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](Resources.CREATING_INSTANCES);

    ModelManager.loadModel(model);
    EventManager.actionsHandler[EventManager.clientActions.MODEL_LOADED]();

    // populate control panel with instances
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](window.Instances);

    console.timeEnd(Resources.LOADING_PROJECT);
    EventManager.actionsHandler[EventManager.clientActions.HIDE_SPINNER]();
    return window.Model;
  },

  /**
   * Fetch variable
   *
   * @param variableId
   * @param datasourceId
   */
  fetchVariables: function (variableIds, datasourceId, callback) {
    if (!Object.prototype.hasOwnProperty.call(window.Model, variableIds)) {
      var params = {};
      params["projectId"] = Project.getId();
      params["variableId"] = variableIds;
      params["dataSourceId"] = datasourceId;

      var requestID = MessageSocket.send("fetch_variable", params, callback);

      EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();

    } else {
      console.log(Resources.VARIABLE_ALREADY_EXISTS);
      // the variable already exists, run the callback
      callback();
    }
  },

  /**
   * Fetch variables and instances
   *
   * @param variables
   * @param instances
   * @param worldId
   * @param datasourceId
   */
  fetch: function (variableIds, instanceIds, worldId, datasourceId, callback) {
    var params = {};
    params["projectId"] = Project.getId();
    params["variables"] = variableIds;
    params["instances"] = instanceIds;
    params["worldId"] = worldId;
    params["dataSourceId"] = datasourceId;

    var requestID = MessageSocket.send("fetch", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Adds fetched variable to model
   *
   * @param rawModel
   */
  addVariableToModel: function (rawModel) {
    console.time(Resources.ADDING_VARIABLE);
    const newInstances = ModelManager.addVariableToModel(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);
    console.timeEnd(Resources.ADDING_VARIABLE);
    console.log(Resources.VARIABLE_ADDED);
  },

  /**
   * Resolve import type
   *
   * @param typePath
   */
  resolveImportType: function (typePaths, callback) {
    if (typeof typePaths == "string") {
      typePaths = [typePaths];
    }
    var params = {};
    params["projectId"] = Project.getId();
    // replace client naming first occurrence - the server doesn't know about it
    var paths = [];
    for (var i = 0; i < typePaths.length; i++) {
      paths.push(typePaths[i].replace(Resources.MODEL_PREFIX_CLIENT + ".", ''));
    }
    params["paths"] = paths;

    var requestID = MessageSocket.send("resolve_import_type", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Swap resolved import type with actual type
   *
   * @param rawModel
   */
  swapResolvedType: function (rawModel) {
    console.time(Resources.IMPORT_TYPE_RESOLVED);
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = ModelFactory.mergeModel(rawModel, true);
    // STEP 2: add new instances for new types if any
    var newInstances = ModelFactory.createInstancesFromDiffReport(diffReport);
    // STEP: 3 update components
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);

    console.timeEnd(Resources.IMPORT_TYPE_RESOLVED);
    console.log(Resources.IMPORT_TYPE_RESOLVED);
  },

  /**
   *
   * @param typePath
   * @param callback
   */
  resolveImportValue: function (typePath, callback) {
    var params = {};
    params["projectId"] = Project.getId();
    // replace client naming first occurrence - the server doesn't know about it
    params["path"] = typePath.replace(Resources.MODEL_PREFIX_CLIENT + ".", '');

    var requestID = MessageSocket.send("resolve_import_value", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Swap resolved import value with actual type
   *
   * @param rawModel
   */
  swapResolvedValue: function (rawModel) {
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = ModelFactory.mergeValue(rawModel, true);
    console.log(Resources.IMPORT_VALUE_RESOLVED);
  },

  /**
   * Augments the instances array with some utilities methods for ease of access
   */
  augmentInstancesArray: Instances.augmentInstancesArray
}
