
export default class World {
  constructor (world, instances, variables) {
    this.instances = instances;
    this.variables = variables;
    this.id = world.id;
    this.name = world.name;
    this._metaType = world.eClass;
  }

  getInstances () {
    return this.instances;
  }

  getVariables () {
    return this.variables;
  }

  getChildren () {
    return this.instances.concat(this.variables);
  }

  getId () {
    return this.id;
  }

  getName () {
    return this.name;
  }

  getMetaType () {
    return this._metaType;
  }

}