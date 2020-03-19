import React, { Component } from "react";
import * as FlexLayout from '../src/index';

const json = {
    global: {tabEnableClose: false},
    borders: [
        {
            "type": "border",
            "location": "bottom",
            "size": 100,
            "children": [
                {
                    "type": "tab",
                    "name": "four",
                    "component": "text"
                }
            ]
        },
        {
            "type": "border",
            "location": "left",
            "size": 100,
            "children": []
        }
    ],
    layout: {
        "type": "row",
        "weight": 100,
        "children": [
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "One",
                        "component": "text"
                    }
                ]
            },
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Two",
                        "component": "text"
                    },
                    {
                        "type": "tab",
                        "name": "Three",
                        "component": "text"
                    }
                ]
            }
        ]
    }
};

export default class FlexLayoutShowcase extends Component {

    constructor(props) {
        super(props);
        this.state = {model: FlexLayout.Model.fromJson(json)};
    }

    factory(node) {
        const component = node.getComponent();
        if (component === "text") {
            return (<div className="panel">Panel {node.getName()}</div>);
        }
    }

    render() {
        return (
            <div style={{position:"absolute", top:"100px", width:"100%"}}>
                <FlexLayout.Layout
                    model={this.state.model}
                    factory={this.factory.bind(this)}/>
            </div>
        )
    }
}
