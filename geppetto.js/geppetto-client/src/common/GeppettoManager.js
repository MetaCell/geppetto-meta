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

export class Manager {


  /**
   *
   * @param payload
   */
  loadProject (project, persisted) {
    // we remove anything from any previous loaded project if there was one
    window.Project = project;
    window.Project.readOnly = !persisted;
  }

  /**
   *
   * @param payload
   */
  loadModel (model) {
    ModelManager.loadModel(model);
    EventManager.modelLoaded();

    // populate control panel with instances
    EventManager.instancesCreated(window.Instances);

    console.timeEnd(Resources.LOADING_PROJECT);
    return window.Model;
  }

  /**
   * Fetch variable
   *
   * @param variableId
   * @param datasourceId
   */
  fetchVariables (variableIds, datasourceId, callback) {
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
  }

  /**
   * Fetch variables and instances
   *
   * @param variables
   * @param instances
   * @param worldId
   * @param datasourceId
   */
  fetch (variableIds, instanceIds, worldId, datasourceId, callback) {
    var params = {};
    params["projectId"] = Project.getId();
    params["variables"] = variableIds;
    params["instances"] = instanceIds;
    params["worldId"] = worldId;
    params["dataSourceId"] = datasourceId;

    var requestID = MessageSocket.send("fetch", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  }

  /**
   * Adds fetched variable to model
   *
   * @param rawModel
   */
  addVariableToModel (rawModel) {
    console.time(Resources.ADDING_VARIABLE);
    const newInstances = ModelManager.addVariableToModel(rawModel);
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);
    console.timeEnd(Resources.ADDING_VARIABLE);
    console.log(Resources.VARIABLE_ADDED);
  }

  /**
   * Resolve import type
   *
   * @param typePath
   */
  resolveImportType (typePaths, callback) {
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
  }

  /**
   * Swap resolved import type with actual type
   *
   * @param rawModel
   */
  swapResolvedType (rawModel) {
    console.time(Resources.IMPORT_TYPE_RESOLVED);
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = ModelFactory.mergeModel(rawModel, true);
    // STEP 2: add new instances for new types if any
    var newInstances = ModelFactory.createInstancesFromDiffReport(diffReport);
    // STEP: 3 update components
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);

    console.timeEnd(Resources.IMPORT_TYPE_RESOLVED);
    console.log(Resources.IMPORT_TYPE_RESOLVED);
  }

  /**
   *
   * @param typePath
   * @param callback
   */
  resolveImportValue (typePath, callback) {
    var params = {};
    params["projectId"] = Project.getId();
    // replace client naming first occurrence - the server doesn't know about it
    params["path"] = typePath.replace(Resources.MODEL_PREFIX_CLIENT + ".", '');

    var requestID = MessageSocket.send("resolve_import_value", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  }

  /**
   * Swap resolved import value with actual type
   *
   * @param rawModel
   */
  swapResolvedValue (rawModel) {
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = ModelFactory.mergeValue(rawModel, true);
    console.log(Resources.IMPORT_VALUE_RESOLVED);
  }

  /**
   * Augments the instances array with some utilities methods for ease of access
   */
  augmentInstancesArray = Instances.augmentInstancesArray
}


export default new Manager();
