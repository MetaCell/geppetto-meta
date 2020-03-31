import React, { Component } from "react";
import model from './model.json';
import PlotComponent from "../PlotComponent";
import ExternalInstance from '@geppettoengine/geppetto-client/js/geppettoModel/model/ExternalInstance';

export default class PlotShowcase extends Component {
    constructor (props) {
        super(props);
        this.instancePath = "nwbfile.acquisition.test_sine_1";
        GEPPETTO.Manager.loadModel(model);
        Instances.getInstance(this.instancePath);
        Instances.getInstance(`${this.instancePath}.data`);
        Instances.getInstance(`${this.instancePath}.timestamps`);
    }

    getLegendName (projectId, experimentId, instance, sameProject) {
        const instancePath = instance.getInstancePath()
            .split('.')
            .filter((word, index, arr) => index != 0 && index != arr.length - 1)
            .join('.');

        if (sameProject) {
            window.Project.getExperiments().forEach(experiment => {
                if (experiment.id == experimentId) {
                    return `${instancePath} [${experiment.name}]`;
                }
            })
        } else {
            GEPPETTO.ProjectsController.getUserProjects().forEach(project => {
                if (project.id == projectId) {
                    project.experiments.forEach(experiment => {
                        if (experiment == experimentId) {
                            return `${instancePath} [${project.name} - ${experiment.name}]`;
                        }
                    })
                }
            })
        }
    }

    extractLegendName (instanceY) {
        let legendName = instanceY.getInstancePath()
            .split('.')
            .filter((word, index, arr) => index != 0 && index != arr.length - 1)
            .join('.');

        if (instanceY instanceof ExternalInstance) {
            legendName = this.getLegendName(instanceY.projectId, instanceY.experimentId, instanceY, window.Project.getId() == instanceY.projectId);
        }
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