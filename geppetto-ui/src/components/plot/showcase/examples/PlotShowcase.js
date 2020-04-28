import React, { Component } from "react";
import PropTypes from 'prop-types';
import model from './../model.json';
import PlotComponent from "./../../PlotComponent";
import ExternalInstance from '@geppettoengine/geppetto-client/js/geppettoModel/model/ExternalInstance';

export default class PlotShowcase extends Component {
    constructor (props) {
        super(props);
        this.instancePath = "nwbfile.acquisition.test_sine_1";
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
            <PlotComponent
                plots={plots}
                id={this.instancePath ? this.instancePath : "empty"}
                extractLegendName={this.extractLegendName}
            />
        );
    }
}