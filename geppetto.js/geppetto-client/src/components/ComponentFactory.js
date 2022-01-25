import React from "react";
import ReactDOM from "react-dom";

const ComponentFactory = {
  componentsMap: {},

  getComponents: function () {
    return this.componentsMap;
  },

  addExistingComponent(componentType, component, override) {
    if (!(componentType in this.componentsMap)) {
      this.componentsMap[componentType] = [];
    }
    if (override) {
      var componentsMap = this.componentsMap[componentType];

      for (var c in componentsMap) {
        if (component.id === componentsMap[c].id) {
          componentsMap[c] = component;
          // var index =  c;
          return;
        }
      }
    }
    this.componentsMap[componentType].push(component);
  },

  removeExistingComponent(componentType, component) {
    if (componentType in this.componentsMap) {
      var index = this.componentsMap[componentType].indexOf(component);
      if (index > -1) {
        this.componentsMap[componentType].splice(index, 1);
      }
    }
  },

  getComponentById(componentType, componentId) {
    var componentsMap = this.componentsMap[componentType];
    for (var c in componentsMap) {
      if (componentId === componentsMap[c].id) {
        return componentsMap[c];
      }
    }
    return undefined;
  },

  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) {
        return "";
      } // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toUpperCase() : match.toLowerCase();
    });
  },

  /**
   * Get an available id for an specific widget
   *
   * @module WidgetUtility
   * @param {String} prefix
   * @param {Array} widgetsList
   * @returns {String} id - Available id for a widget
   */
  getAvailableComponentId(componentType) {
    var index = 0;
    var id = "";
    var available;

    var components = [];
    if (componentType in this.componentsMap) {
      components = this.componentsMap[componentType];
    }

    do {
      index++;
      id = componentType + index;
      available = true;

      for (var componentsIndex in components) {
        if (
          components[componentsIndex].props.id.toUpperCase() == id.toUpperCase()
        ) {
          available = false;
          break;
        }
      }
    } while (available == false);

    return this.camelize(id);
  },

  _addComponent: function (
    componentToAdd,
    componentType,
    properties,
    container,
    callback,
    isWidget
  ) {
    // Prepare properties
    if (properties === undefined) {
      properties = {};
    }
    properties.componentType = componentType;
    if (!("id" in properties)) {
      properties["id"] = this.getAvailableComponentId(componentType);
    }
    if (!("isStateless" in properties)) {
      properties["isStateless"] = false;
    }

    if (container == null && isWidget) {
      // FIXME Redundant, see addWidget
      container = document.getElementById("widgetContainer");
    }
    properties["parentContainer"] = container;

    // Create component/widget
    var type = componentToAdd;

    var component = React.createFactory(type)(properties);

    return component;
  },

  _renderComponent: function (
    component,
    componentType,
    properties,
    container,
    callback,
    isWidget
  ) {
    var renderedComponent = (window[properties.id] = this.renderComponent(
      component,
      container,
      callback
    ));

    renderedComponent.container = container;

    // Register in component map
    if (!(componentType in this.componentsMap)) {
      this.componentsMap[componentType] = [];
    }
    this.componentsMap[componentType].push(renderedComponent);
    return renderedComponent;
  },

  renderComponent: function (component, container, callback) {
    return ReactDOM.render(component, container, callback);
  },
};

export default ComponentFactory;
