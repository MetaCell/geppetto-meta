/**
 * Client class use to handle Geppetto workflows
 *
 * @module Manager
 * @author Matteo Cantarelli
 */

import ModelFactory from "./ModelFactory";
import Resources from "./Resources";

import { augmentInstancesArray } from "./Instances";

/**
 *
 * @param payload
 */
export function loadModel(model) {
  ModelFactory.cleanModel();
  console.timeEnd(Resources.PARSING_MODEL);

  console.time(Resources.CREATING_MODEL);

  // build Geppetto model here (once off operation when project is loaded)
  window.Model = ModelFactory.createGeppettoModel(model, true, true);
  console.timeEnd(Resources.CREATING_MODEL);

  console.time(Resources.CREATING_INSTANCES);

  // Initialize instances with static instances already present in the model
  if (window.Model.getCurrentWorld()) {
    window.Instances = window.Model.getCurrentWorld().getInstances();
    window.Instances.push.apply(window.Instances, ModelFactory.instantiateVariables(window.Model));
  } else {
    window.Instances = ModelFactory.instantiateVariables(window.Model);
  }

  augmentInstancesArray(window.Instances);
  console.timeEnd(Resources.CREATING_INSTANCES);

  console.timeEnd(Resources.LOADING_PROJECT);

  return window.Model;
}

/**
 * Adds fetched variable to model
 *
 * @param rawModel
 */
export function addVariableToModel(rawModel) {
  // STEP 1: merge model - expect a fully formed Geppetto model to be merged into current one
  const diffReport = ModelFactory.mergeModel(rawModel);
  // STEP 2: add new instances for new variables if any
  const newInstances = ModelFactory.createInstancesFromDiffReport(diffReport);
  return newInstances;
}

export default { loadModel, addVariableToModel };
