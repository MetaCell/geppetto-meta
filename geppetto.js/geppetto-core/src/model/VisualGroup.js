/**
 * Client class use to represent a VisualGroup Node, used for visualization tree
 * properties.
 *
 * @module nodes/VisualGroup
 * @author Jesus R. Martinez (jesus@metacell.us)
 * @author Giovanni Idili
 * @author Matteo Cantarelli
 */
import ModelFactory from "../ModelFactory";
import Resources from "../Resources";

var ObjectWrapper = require("./ObjectWrapper").default;

function VisualGroup(options) {
  ObjectWrapper.prototype.constructor.call(this, options);
  this.visualGroupElements = options.visualGroupElements != undefined ? options.visualGroupElements : [];
  this.tags = options.tags != undefined ? options.tags : [];
}

VisualGroup.prototype = Object.create(ObjectWrapper.prototype);
VisualGroup.prototype.constructor = VisualGroup;

/**
 * Get low spectrum color
 *
 * @command VisualGroup.getLowSpectrumColor()
 * @returns {String} Low Spectrum Color
 */
VisualGroup.prototype.getLowSpectrumColor = function () {
  return this.wrappedObj.lowSpectrumColor;
};

/**
 * Get high spectrum color of visual group
 *
 * @command VisualGroup.getHighSpectrumColor()
 * @returns {String} High Spectrum color of visual gorup
 */
VisualGroup.prototype.getHighSpectrumColor = function () {
  return this.wrappedObj.highSpectrumColor;
};

/**
 * Get this visual group children
 *
 * @command VisualGroup.getTags()
 * @returns {List<String>} All tags for this visual group
 */
VisualGroup.prototype.getTags = function () {
  return this.tags;
};

/**
 * Get this visual group children
 *
 * @command VisualGroup.getVisualGroupElements()
 * @returns {List<Object>} All children e.g. Visual Group Element Nodes
 */
VisualGroup.prototype.getVisualGroupElements = function () {
  return this.visualGroupElements;
};

VisualGroup.prototype.getChildren = function () {
  return this.visualGroupElements;
};

VisualGroup.prototype.show = function (mode, instances) {
  var message;
  var elements = this.getVisualGroupElements();

  if (instances == undefined) {
    var instances = ModelFactory.getAllInstancesOf(this.getParent());
  }

  if (mode) {
    message = Resources.SHOWING_VISUAL_GROUPS + this.id;
  } else {
    message = Resources.HIDING_VISUAL_GROUPS + this.id;
  }

  if (elements.length > 0) {
    this.showAllVisualGroupElements(elements, mode, instances);
  } else {
    message = Resources.NO_VISUAL_GROUP_ELEMENTS;
  }

  return message;
};

VisualGroup.prototype.showAllVisualGroupElements = function (elements, mode, instances) {
  console.warn("Deprecated api call");
  console.trace();
};

VisualGroup.prototype.getMinDensity = function () {
  var allElements = [];

  var elements = this.getVisualGroupElements();

  // calculate mean;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].getValue() != null) {
      allElements.push(elements[i].getValue());
    }
  }

  return allElements.length == 0 ? null : Math.min.apply(null, allElements);
};

VisualGroup.prototype.getMaxDensity = function () {
  var allElements = [];

  var elements = this.getVisualGroupElements();

  // calculate mean;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].getValue() != null) {
      allElements.push(elements[i].getValue());
    }
  }

  return allElements.length == 0 ? null : Math.max.apply(null, allElements);
};

/**
 * Print out formatted node
 */
VisualGroup.prototype.print = function () {
  return (
    "Name : " +
    this.getName() +
    "\n" +
    "    Id: " +
    this.getId() +
    "\n" +
    "    Type : " +
    this.getType() +
    "\n" +
    "    HighSpectrumColor : " +
    this.getHighSpectrumColor() +
    "\n" +
    "    LowSpectrumColor : " +
    this.getLowSpectrumColor() +
    "\n"
  );
};

// Compatibility with new imports and old require syntax
VisualGroup.default = VisualGroup;
module.exports = VisualGroup;
