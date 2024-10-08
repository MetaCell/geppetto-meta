/**
 * The parent node from where all other nodes extend
 *
 * @module model/Node
 * @author Jesus R. Martinez (jesus@metacell.us)
 */

import Backbone from 'backbone';

const Model = Backbone.Model.extend({
  name: "",
  instancePath: "",
  id: "",
  domainType: "",
  _metaType: "",
  aspectNode: null,
  parent: null,
  tags: null,

  /**
   * Gets the instance path of the node
   *
   * @command Node.getInstancePath()
   * @returns {String} Instance path of this node
   */
  getInstancePath() {
    return this.instancePath;
  },

  /**
   * Gets the name of the node
   *
   * @command Node.getName()
   * @returns {String} Name of the node
   */
  getName() {
    return this.name;
  },

  getAspectNode() {
    return this.aspectNode;
  },

  /**
   * Sets the name of the node
   *
   * @command Node.setName()
   */
  setName(newname) {
    this.name = newname;
  },

  /**
   * Get the id associated with node
   *
   * @command Node.getId()
   * @returns {String} ID of node
   */
  getId() {
    return this.id;
  },

  getDomainType() {
    return this.domainType;
  },

  setDomainType(newDomainType) {
    this.domainType = newDomainType;
  },

  setParent(parent) {
    this.parent = parent;
  },

  getParent() {
    return this.parent;
  },

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
      const children = this.getChildren();
      children.forEach((child) => child._all(predicate, matches));
    }

    return matches;
  },

  /**
   * Search inside a node for all the nodes of a specific domain type.
   *
   * @param {String} domainType - Domain type
   * @returns {Array} List of Nodes
   */
  getSubNodesOfDomainType(domainType) {
    return this._all((n) => n.domainType === domainType);
  },

  /**
   * Search inside a node for all the nodes of a specific meta type.
   *
   * @param {String} metaType - Meta Type
   * @returns {Array} List of Nodes
   */
  getSubNodesOfMetaType(metaType) {
    return this._all((n) => n._metaType === metaType);
  },
});

export default {
  Model,
};