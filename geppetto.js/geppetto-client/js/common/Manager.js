/**
 * Client class use to handle Geppetto workflows
 *
 * @module Manager
 * @author Matteo Cantarelli
 */

import EventManager from '../common/EventManager';

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
    EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.LOADING_PROJECT);
    if (Project) {
      Project.initialize();
    }
    GEPPETTO.G.listeners = [];

    window.Project = GEPPETTO.ProjectFactory.createProjectNode(project, persisted);
    window.Project.readOnly = !persisted;

    EventManager.actionsHandler[EventManager.clientActions.PROJECT_LOADED]();
  },

  /**
   *
   * @param payload
   */
  loadModel: function (model) {
    GEPPETTO.ModelFactory.cleanModel();
    console.timeEnd(GEPPETTO.Resources.PARSING_MODEL);

    console.time(GEPPETTO.Resources.CREATING_MODEL);
    EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.CREATING_MODEL);
    // build Geppetto model here (once off operation when project is loaded)
    window.Model = GEPPETTO.ModelFactory.createGeppettoModel(model, true, true);
    console.timeEnd(GEPPETTO.Resources.CREATING_MODEL);

    console.time(GEPPETTO.Resources.CREATING_INSTANCES);
    EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.CREATING_INSTANCES);

    // Initialize instances with static instances already present in the model
    if (window.Model.getCurrentWorld()) {
      window.Instances = window.Model.getCurrentWorld().getInstances();
      window.Instances.push.apply(window.Instances, GEPPETTO.ModelFactory.instantiateVariables(window.Model));
    } else {
      window.Instances = GEPPETTO.ModelFactory.instantiateVariables(window.Model);
    }

    this.augmentInstancesArray(window.Instances);
    console.timeEnd(GEPPETTO.Resources.CREATING_INSTANCES);

    EventManager.actionsHandler[EventManager.clientActions.MODEL_LOADED]();

    // populate control panel with instances
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](window.Instances);

    console.timeEnd(GEPPETTO.Resources.LOADING_PROJECT);
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

      var requestID = GEPPETTO.MessageSocket.send("fetch_variable", params, callback);

      EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();

    } else {
      GEPPETTO.CommandController.log(GEPPETTO.Resources.VARIABLE_ALREADY_EXISTS);
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

    var requestID = GEPPETTO.MessageSocket.send("fetch", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Adds fetched variable to model
   *
   * @param rawModel
   */
  addVariableToModel: function (rawModel) {
    console.time(GEPPETTO.Resources.ADDING_VARIABLE);
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = GEPPETTO.ModelFactory.mergeModel(rawModel);
    // STEP 2: add new instances for new variables if any
    var newInstances = GEPPETTO.ModelFactory.createInstancesFromDiffReport(diffReport);
    // STEP: 3 update components
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);
    console.timeEnd(GEPPETTO.Resources.ADDING_VARIABLE);
    GEPPETTO.CommandController.log(GEPPETTO.Resources.VARIABLE_ADDED);
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
      paths.push(typePaths[i].replace(GEPPETTO.Resources.MODEL_PREFIX_CLIENT + ".", ''));
    }
    params["paths"] = paths;

    var requestID = GEPPETTO.MessageSocket.send("resolve_import_type", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Swap resolved import type with actual type
   *
   * @param rawModel
   */
  swapResolvedType: function (rawModel) {
    console.time(GEPPETTO.Resources.IMPORT_TYPE_RESOLVED);
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = GEPPETTO.ModelFactory.mergeModel(rawModel, true);
    // STEP 2: add new instances for new types if any
    var newInstances = GEPPETTO.ModelFactory.createInstancesFromDiffReport(diffReport);
    // STEP: 3 update components
    EventManager.actionsHandler[EventManager.clientActions.INSTANCES_CREATED](newInstances);

    console.timeEnd(GEPPETTO.Resources.IMPORT_TYPE_RESOLVED);
    GEPPETTO.CommandController.log(GEPPETTO.Resources.IMPORT_TYPE_RESOLVED);
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
    params["path"] = typePath.replace(GEPPETTO.Resources.MODEL_PREFIX_CLIENT + ".", '');

    var requestID = GEPPETTO.MessageSocket.send("resolve_import_value", params, callback);

    EventManager.actionsHandler[EventManager.clientActions.SPIN_LOGO]();
  },

  /**
   * Swap resolved import value with actual type
   *
   * @param rawModel
   */
  swapResolvedValue: function (rawModel) {
            
    // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
    var diffReport = GEPPETTO.ModelFactory.mergeValue(rawModel, true);
    GEPPETTO.CommandController.log(GEPPETTO.Resources.IMPORT_VALUE_RESOLVED);
  },

  /**
   * Augments the instances array with some utilities methods for ease of access
   */
  augmentInstancesArray: function (instances) {
    // create global shortcuts to top level instances
    for (var i = 0; i < instances.length; i++) {
      // NOTE: tampering with the window object like this is probably a horrible idea
      window[instances[i].getId()] = instances[i];
      window.Instances[instances[i].getId()] = instances[i];
    }

    // add method to add instances to window.Instances
    instances.addInstances = function (instancePaths) {
      if (!(instancePaths.constructor === Array)) {
        // if it's not an array throw it into an array with a single element
        instancePaths = [instancePaths];
      }

      GEPPETTO.ModelFactory.addInstances(instancePaths, window.Instances, window.Model);
    };

    instances.getInstance = function (instancePath, create, override) {
      if (create == undefined) {
        create = true;
      }

      var instances = [];
      var InstanceVarName = "Instances.";
      var arrayParameter = true;

      if (!(instancePath.constructor === Array)) {
        instancePath = [instancePath];
        arrayParameter = false;
      }

      // check if we have any [*] for array notation and replace with exploded paths
      for (var j = 0; j < instancePath.length; j++) {
        if (instancePath[j].indexOf('[*]') > -1) {
          var arrayPath = instancePath[j].substring(0, instancePath[j].indexOf('['));
          var subArrayPath = instancePath[j].substring(instancePath[j].indexOf(']') + 1, instancePath[j].length);
          var arrayInstance = Instances.getInstance(arrayPath);
          var arraySize = arrayInstance.getSize();

          // remove original * entry
          instancePath.splice(j, 1);
          // add exploded elements
          for (var x = 0; x < arraySize; x++) {
            instancePath.push(arrayPath + '[' + x + ']' + subArrayPath);
          }
        }
      }


      for (var i = 0; i < instancePath.length; i++) {
        try {
          var potentialVar = eval(InstanceVarName + instancePath[i]);
          if (potentialVar != undefined) {
            if (override) {
              GEPPETTO.ModelFactory.deleteInstance(instances[i]);
              Instances.addInstances(instancePath[i]);
              instances.push(eval(InstanceVarName + instancePath[i]));
            } else {
              instances.push(potentialVar);
            }
          } else {
            if (create) {
              Instances.addInstances(instancePath[i]);
              instances.push(eval(InstanceVarName + instancePath[i]));
            }
          }
        } catch (e) {
          if (create) {
            try {

              Instances.addInstances(instancePath[i]);
              instances[i] = eval(InstanceVarName + instancePath[i]);
            } catch (e) {
              throw ("The instance " + instancePath[i] + " does not exist in the current model");
            }
          }
        }
      }

      if (instances.length == 1 && !arrayParameter) {
        // if we received an array we want to return an array even if there's only one element
        return instances[0];
      } else {
        return instances;
      }
    };
  },
}
