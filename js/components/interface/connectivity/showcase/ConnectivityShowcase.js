import React, {Component} from "react";
import model from './model.json';
import options from './options.json';
import {Matrix} from "../layouts/Matrix";
import ConnectivityComponent from "../ConnectivityComponent";

export default class ConnectivityShowcase extends Component {
    constructor(props) {
        super(props);
        window.GEPPETTO.Manager.loadModel(model);
        this.data = Instances[0];
        this.options = this.deserializeOptions();
        this.colorMap = "undefined";
        this.size = { width: 600, height: 500 };
        this.config = {
            "matrix": {
                layout: new Matrix(),
                colors: ["#cb0000", "#003398"],
                names: ["pyramidals_48", "baskets_12"],
            }
        }

    }

    deserializeOptions(){
        const deserializedOptions = {};
        for (const item in options){
            if (options[item].type === "function" || options[item].type === "library"){
                deserializedOptions[item] = eval('(' + options[item].value + ')');
            } else {
                deserializedOptions[item] = options[item].value;
            }
        }
        return deserializedOptions
    }

    render() {

        const matrix = this.config['matrix'];

        return (
            <ConnectivityComponent
                id="ConnectivityContainer"
                size={this.size}
                data={this.data}
                options={this.options}
                colorMap={this.colorMap}
                colors={matrix.colors}
                names={matrix.names}
                layout={matrix.layout}
            />
        );
    }
}