import React, { Component } from "react";
import ModelManager from '@metacell/geppetto-meta-core/ModelManager';

import model from './../model';
import PlotComponent from "./../../PlotComponent";

export default class PlotShowcase extends Component {
  constructor (props) {
    super(props);
    this.instancePath = "nwbfile.acquisition.test_sine_1";
    ModelManager.loadModel(model);
    Instances.getInstance(this.instancePath);
    Instances.getInstance(`${this.instancePath}.data`);
    Instances.getInstance(`${this.instancePath}.timestamps`);
  }

  extractLegendName (instanceY) {
    let legendName = instanceY.getInstancePath()
      .split('.')
      .filter((word, index, arr) => index != 0 && index != arr.length - 1)
      .join('.');

    return legendName
  }

  render () {
    const color = 'white';
    const guestList = [];

    const plots = [{
      x: `${this.instancePath}.timestamps`,
      y: `${this.instancePath}.data`,
      lineOptions: { color: color }
    }];

    if (guestList && guestList.length > 0) {
      plots.push(
        ...guestList.map(guest => ({
          x: `${guest.instancePath}.timestamps`,
          y: `${guest.instancePath}.data`,
          lineOptions: { color: guest.color }
        }))
      )
    }

    return (
      <div style={{ width: 600, height: 500 }}>
        <PlotComponent
          plots={plots}
          id={this.instancePath ? this.instancePath : "empty"}
          extractLegendName={this.extractLegendName}
        />
      </div>
    );
  }
}
