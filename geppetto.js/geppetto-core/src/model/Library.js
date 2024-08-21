/**
 * Client class use to represent a library that contains a set of types.
 *
 * @module model/Library
 * @author Giovanni Idili
 */

const ObjectWrapper = require("./ObjectWrapper").default;
const ImportType = require("./ImportType").default;

function Library(options) {
  ObjectWrapper.prototype.constructor.call(this, options);
  this.types = options.types != "undefined" ? options.types : [];
  this.importTypes = [];
}

Library.prototype = Object.create(ObjectWrapper.prototype);
Library.prototype.constructor = Library;

/**
 * Get types for this library
 *
 * @command Library.getTypes()
 *
 * @returns {List<Type>} - list of Type objects
 *
 */
Library.prototype.getTypes = function () {
  return this.types;
};

/**
 * Get combined children
 *
 * @command Library.getChildren()
 *
 * @returns {List<Object>} - List of children
 *
 */
Library.prototype.getChildren = function () {
  return this.types;
};

Library.prototype.addImportType = function (importType) {
  this.importTypes.push(importType);
};

Library.prototype.removeImportType = function (importType) {
  this.importTypes.remove(importType);
};

Library.prototype.resolveAllImportTypes = (callback) => {
  console.warn("Deprecated api call");
  console.trace();
};

// Overriding set
Library.prototype.setTypes = function (types) {
  this.types = types;

  for (let i = 0; i < types.length; i++) {
    if (types[i] instanceof ImportType) {
      this.addImportType(types[i]);
    }
  }

  return this;
};

// Overriding set
Library.prototype.addType = function (type) {
  type.setParent(this);

  // add to library in geppetto object model
  this.types.push(type);

  if (type instanceof ImportType) {
    this.addImportType(type);
  }

  return this;
};

// Compatibility with new imports and old require syntax
Library.default = Library;
module.exports = Library;
