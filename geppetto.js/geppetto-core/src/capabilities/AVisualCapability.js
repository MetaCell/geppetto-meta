

/**
 * Client class use to represent an instance object (instantiation of a variable).
 *
 * @module model/AVisualCapability
 * @author Giovanni Idili
 */


export default {
  capabilityId: 'VisualCapability',
  visible: true,
  selected: false,

  /**
   * Hides the instance or class of instances
   *
   * @command AVisualCapability.hide()
   *
   */
  hide: function (nested) {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Shows the instance or class of instances
   *
   * @command AVisualCapability.show()
   *
   */
  show: function (nested) {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Returns whether the object is visible or not
   *
   * @command AVisualCapability.isVisible()
   *
   */
  isVisible: function () {
    return this.visible;
  },

  /**
   * Returns whether the object is selected or not
   *
   * @command AVisualCapability.isSelected()
   *
   */
  isSelected: function () {
    return this.selected;
  },

  /**
   * Change the opacity of an instance or class of instances
   *
   * @command AVisualCapability.setOpacity(opacity)
   *
   */
  setOpacity: function (opacity) {
    console.warn("Deprecated api call");
    console.trace();
  },


  /**
   *
   * @returns {*}
   */
  getColor: function () {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Change the color of an instance or class of instances
   *
   * @command AVisualCapability.setColor(color)
   *
   */
  setColor: function (color) {

    console.warn("Deprecated api call");
    console.trace();


    return this;
  },

  /**
   * Select the instance or class of instances
   *
   * @command AVisualCapability.select()
   *
   */
  select: function (nested, geometryIdentifier, point) {
    console.warn("Deprecated api call");
    console.trace();

    return message;
  },

  /**
   * Deselects the instance or class of instances
   *
   * @command AVisualCapability.deselect()
   *
   */
  deselect: function (nested) {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Zooms to instance or class of instances
   *
   * @command AVisualCapability.zoomTo()
   *
   */
  zoomTo: function () {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Set the type of geometry to be used for this aspect
   */
  setGeometryType: function (type, thickness) {
    console.warn("Deprecated api call");
    console.trace();
  },

  /**
   * Show connection lines for instances.
   * @param {boolean} mode - Show or hide connection lines
   */
  showConnectionLines: function (mode) {
    console.warn("Deprecated api call");
    console.trace();
  }
}
