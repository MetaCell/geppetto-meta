import ObjectWrapper from './ObjectWrapper';
import { extend } from '../../common/Utils';
/**
 * Client class use to represent a variable.
 *
 * @module model/Value
 * @author Nitesh Thali
 */
export default class Value extends ObjectWrapper{


  constructor (options) {
    super(options);
    this.pointerValue = options.pointerValue;
    this.capabilities = [];
    extend(this, this.getObject(this.wrappedObj));
  }

  getObject (rawValue) {
    switch (rawValue.eClass) {
    case 'JSON':
      return JSON.parse(rawValue.json);
    case 'Metadata':
      return this.getObjectForMetadata(rawValue.value);
    default:{
      let obj = { ...rawValue };
      delete obj.eClass;
      if (obj.value) {
        extend(obj, this.getObject(obj.value));
      }
      return obj;
    }

    }

    // TODO handle other value types
  }


  getObjectForMetadata (rawValue) {
    let obj = {}
    for (let stringValueMap of rawValue) {
      obj[stringValueMap.key] = this.getObject(stringValueMap.value);
    }
    return obj;
  }
    
    
}
