/**
 * volumetric_viewer
 * A simple rest api for a volumetric viewer
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: apiteam@swagger.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', process.cwd()+'/src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require(process.cwd()+'/src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.VolumetricViewer);
  }
}(this, function(expect, VolumetricViewer) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new VolumetricViewer.InlineResponse500();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('InlineResponse500', function() {
    it('should create an instance of InlineResponse500', function() {
      // uncomment below and update the code to test InlineResponse500
      //var instane = new VolumetricViewer.InlineResponse500();
      //expect(instance).to.be.a(VolumetricViewer.InlineResponse500);
    });

    it('should have the property error (base name: "error")', function() {
      // uncomment below and update the code to test the property error
      //var instane = new VolumetricViewer.InlineResponse500();
      //expect(instance).to.be();
    });

  });

}));
