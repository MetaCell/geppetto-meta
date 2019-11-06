import Instance from './Instance';

export default class SimpleInstance extends Instance{
 
  constructor (node) {
    super(node);
    this.value = node.value;
    this.type = node.type;
    this.visualValue = node.visualValue;
    this.point = node.point;
    this.tags = node.tags;
    this.wrappedObj = node;
    this._metaType = node.eClass;
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

}