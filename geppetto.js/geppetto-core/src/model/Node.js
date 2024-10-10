/**
 * The parent node from where all other nodes extend
 *
 * @module model/Node
 * @author Jesus R. Martinez (jesus@metacell.us)
 */


class Model {
  
  constructor() {
    this.name = "";
    this.instancePath = "";
    this.id = "";
    this.domainType = "";
    this._metaType = "";
    this.aspectNode = null;
    this.parent = null;
    this.tags = null;
  }

  /**
   * Gets the instance path of the node
   *
   * @command Node.getInstancePath()
   * @returns {String} Instance path of this node
   */
  getInstancePath() {
    return this.instancePath;
  }

  /**
   * Gets the name of the node
   *
   * @command Node.getName()
   * @returns {String} Name of the node
   */
  getName() {
    return this.name;
  }

  getAspectNode() {
    return this.aspectNode;
  }

  /**
   * Sets the name of the node
   *
   * @command Node.setName()
   */
  setName(newname) {
    this.name = newname;
  }

  /**
   * Get the id associated with node
   *
   * @command Node.getId()
   * @returns {String} ID of node
   */
  getId() {
    return this.id;
  }

  getDomainType() {
    return this.domainType;
  }

  setDomainType(newDomainType) {
    this.domainType = newDomainType;
  }

  setParent(parent) {
    this.parent = parent;
  }

  getParent() {
    return this.parent;
  }

  /**
   * Recursively collects all nodes matching the given predicate.
   * @param {Function} predicate - Function to test each node.
   * @param {Array} matches - Array to collect matched nodes.
   * @returns {Array} List of matched nodes.
   */
  _all(predicate, matches = []) {
    if (predicate(this)) {
      matches.push(this);
    }

    if (typeof this.getChildren === "function") {
      for (const child of Object.values(this.getChildren())) {
        this._all.call(child, predicate, matches)
      }
    }

    return matches;
  }

  /**
   * Search inside a node for all the nodes of a specific domain type.
   *
   * @param {String} domainType - Domain type
   * @returns {Array} List of Nodes
   */
  getSubNodesOfDomainType(domainType) {
    return this._all((n) => n.domainType === domainType);
  }

  /**
   * Search inside a node for all the nodes of a specific meta type.
   *
   * @param {String} metaType - Meta Type
   * @returns {Array} List of Nodes
   */
  getSubNodesOfMetaType(metaType) {
    return this._all((n) => n._metaType === metaType);
  }
};

export default Model;