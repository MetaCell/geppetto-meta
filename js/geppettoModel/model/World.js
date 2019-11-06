
export default class World {
  constructor (instances, variables) {
    this.instances = instances;
    this.variables = variables;
  }

  getInstances () {
    return this.instances;
  }

  getVariables () {
    return this.variables;
  }
}