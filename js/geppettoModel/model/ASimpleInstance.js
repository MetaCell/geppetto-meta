import ObjectWrapper from './ObjectWrapper';
import { extend } from '../../common/Utils';

export default class ASimpleInstance extends ObjectWrapper{
 
  constructor (node) {
    super({ wrappedObj: node });
    this.value = node.value;
    this.type = node.type;
    this.visualValue = node.visualValue;
    this.point = node.point;
    this.tags = node.tags;
    this.capabilities = [];
    this.connections = [];
  }

  getTypes () {
    return [this.getType()];
  }
        
  getValues () {
    return [this.getValue()];
  }
  
  getType () {
    return this.type;
  }
        
  getValue () {
    return this.value;
  }
  
  getVisualValue () {
    return this.visualValue;
  }

  hasVisualValue () {
    return this.visualValue;
  }

  getPoint () {
    return this.point;
  }

  hasVisualType () {
    throw "Simple instances don't support visual type: use hasVisualValue instead";
  }

  getVisualType () {
    throw "Simple instances don't support visual type: use getVisualValue instead";
  }

  getVariable () {
    throw "Simple instances don't support variables";
  }

  getChildren () {
    return [];
  }

  getInstancePath () {
    return this.id;
  }

  getPath () {
    return this.getInstancePath();
  }

  getRawInstancePath () {
    return this.getPath();
  }

  getParent () {
    return null;
  }

  addChild () {
    throw "Simple instances don't have children";
  }

  extendApi (extensionObj) {
    extend(this, extensionObj);
    this.capabilities.push(extensionObj.capabilityId);
  }

  hasCapability (capabilityId) {
    return this.capabilities.findIndex(capability => capability === capabilityId) != -1;
  }

  getCapabilities () {
    return this.capabilities;
  }

  getConnections (direction) {
    console.error('getConnections is not yet implemented for simple instances');
    return this.connections;
  }

  addConnection (connection) {
    this.connections.push(connection);
  }
}