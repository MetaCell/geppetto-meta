import Instance from './Instance'

/**
 * Client class use to represent an array of instances.
 *
 * @module model/ArrayInstance
 * @author Giovanni Idili
 * @author Matteo Cantarelli
 */

class ArrayInstance extends Instance {

  constructor (options) {
    super(options);
    this.size = options.size;
    this.length = options.size;
  }


  getConnections () {
    // We don't currently support connections for arrays
    return [];
  }

  getChildren () {
    const children = [];
    for (let i = 0; i < this.getSize(); i++) {
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
  getSize () {
    return this.size;
  }

}

export default ArrayInstance