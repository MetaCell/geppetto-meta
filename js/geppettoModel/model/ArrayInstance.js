import Instance from './Instance';

/**
 * Client class use to represent an array of instances.
 *
 * @module model/ArrayInstance
 * @author Giovanni Idili
 * @author Matteo Cantarelli
 */

export default class ArrayInstance extends Instance {

  constructor (options) {
    super(options);
    this.size = options.size;
    this.length = options.size;
  }


  getConnections = function () {
    // We don't currently support connections for arrays
    return [];
  }

  getChildren = function () {
    var children = [];
    for (var i = 0; i < this.getSize(); i++) {
      children.push(this[i]);
    }
    return children;
  }

  /**
   * Get the size of the array instance
   *
   * @command ArrayInstance.getSize()
   *
   * @returns {Integer} - size of the array
   *
   */
  getSize = function () {
    return this.size;
  }

}

