/**
 * Client class use to augment a model with state variable capabilities
 *
 * @module model/ADerivedStateVariableCapability
 * @author Adrian Quintana
 */
import ModelFactory from "../ModelFactory";

export default {
  capabilityId: "DerivedStateVariableCapability",
  watched: false,
  timeSeries: null,
  inputs: null,

  /**
   * Get value of quantity
   *
   * @command Variable.getTimeSeries()
   * @returns {String} Value of quantity
   */
  getTimeSeries: function (step) {
    const wrappedObj = this.getVariable().getWrappedObj();
    if (wrappedObj.normalizationFunction === "SPACEPLOT") {
      return this.getTimeSeriesFromInput(step);
    }
    if (wrappedObj.normalizationFunction === "CONSTANT") {
      return wrappedObj.timeSeries;
    }
  },

  getTimeSeriesFromInput: function (step) {
    const timeSeries = [];
    // FIXME: Remove this once we pass pointers instead of ids
    if (!this.inputs) {
      this.inputs = [];
      for (const inputIndex in this.getVariable().getWrappedObj().inputs) {
        const inputId = this.getVariable().getWrappedObj().inputs[inputIndex];
        this.inputs.push(ModelFactory.findMatchingInstanceByID(inputId, window.Instances[0].getChildren()));
      }
    }

    for (const inputIndex in this.inputs) {
      const inputTimeSeries = this.inputs[inputIndex].getTimeSeries();
      if (inputTimeSeries !== undefined) {
        let sampleIndex = step;
        if (step === undefined) {
          sampleIndex = inputTimeSeries.length - 1;
        }
        timeSeries.push(inputTimeSeries[sampleIndex]);
      } else {
        timeSeries.push([]);
      }
    }
    return timeSeries;
  },

  /**
   * Set the time series for the state variable
   *
   * @command Variable.setTimeSeries()
   * @returns {Object} The state variable
   */
  setTimeSeries: function (timeSeries) {
    this.timeSeries = timeSeries;
    return this;
  },

  /**
   * Get the initial value for the state variable
   *
   * @command Variable.getInitialValue()
   * @returns {Object} The initial value of the state variable
   */
  getInitialValue: function () {
    return this.getVariable().getWrappedObj().initialValues;
  },

  /**
   * Get the type of tree this is
   *
   * @command Variable.getUnit()
   * @returns {String} Unit for quantity
   */
  getUnit: function () {
    if (!this.timeSeries) {
      return this.extractUnit();
    }
    if (this.timeSeries.unit == null || this.timeSeries.unit === undefined) {
      if (this.getVariable() !== undefined || this.getVariable() != null) {
        return this.extractUnit();
      }
    } else {
      return this.timeSeries.unit;
    }
  },

  extractUnit: function () {
    const initialValues = this.getVariable().getWrappedObj().initialValues;

    for (const initialValue of initialValues) {
      const value = initialValue.value;
      if (value.eClass === "PhysicalQuantity" || value.eClass === "TimeSeries") {
        return unit;
      }
    }
    return undefined;
  },

  /**
   * Get watched
   *
   * @command Variable.getWatched()
   * @returns {boolean} true if this variable is being watched
   */
  isWatched: function () {
    // NOTE: this.watched is a flag added by this API / Capability
    return this.watched;
  },
};
