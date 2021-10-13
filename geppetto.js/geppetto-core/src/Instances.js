/**
 * Client class use to handle Geppetto workflows
 *
 * @module Manager
 * @author Matteo Cantarelli
 */


import ModelFactory from './ModelFactory';


/**
 * Augments the instances array with some utilities methods for ease of access
 */
export function augmentInstancesArray (instances) {
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

    ModelFactory.addInstances(instancePaths, window.Instances, window.Model);
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
            ModelFactory.deleteInstance(instances[i]);
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
  }
      
}

export default { augmentInstancesArray }