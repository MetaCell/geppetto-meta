

/**
 * Client class use to represent an array type.
 *
 * @module model/ImportValue
 * @author nitesh thali
 */

import Value from './Value';


function ImportValue (options) {
  Value.prototype.constructor.call(this, options);
}

ImportValue.prototype = Object.create(Value.prototype);
ImportValue.prototype.constructor = ImportValue;

ImportValue.prototype.resolve = (callback) => {
  console.warn("Deprecated api call: use the GeppettoManager api");
  console.trace();
};


/**
 * Get path
 *
 * @command Type.getPath()
 *
 * @returns {String} - path
 *
 */
ImportValue.prototype.getPath = function () {
  if (this.parent) {
    return this.parent.getPath();
  }
  throw "A value should always have a parent!";
};

export default ImportValue