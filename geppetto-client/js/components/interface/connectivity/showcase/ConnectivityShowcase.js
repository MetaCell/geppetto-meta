import React, { Component } from "react";
import model from './model.json';
import { Matrix } from "../layouts/Matrix";
import ConnectivityComponent from "../ConnectivityComponent";

export default class ConnectivityShowcase extends Component {
  constructor (props) {
    super(props);
    GEPPETTO.Manager.loadModel(model);
    this.data = Instances[0];
    this.colorMap = "undefined";
    this.size = { width: 600, height: 500 };
    this.config = {
      "matrix": {
        layout: new Matrix(),
        colors: ["#cb0000", "#003398"],
        names: ["pyramidals_48", "baskets_12"],
      }
    };
    this.linkType = this.linkType.bind(this);
  }

  linkType (c){
    return GEPPETTO.ModelFactory.getAllVariablesOfType(c.getParent(),GEPPETTO.ModelFactory.geppettoModel.neuroml.synapse)[0].getId()
  }

  render () {
    const matrix = this.config['matrix'];

    return (
      <ConnectivityComponent
        id="ConnectivityContainer"
        size={this.size}
        data={this.data}
        colorMap={this.colorMap}
        colors={matrix.colors}
        names={matrix.names}
        layout={matrix.layout}
        modelFactory={GEPPETTO.ModelFactory}
        resources={GEPPETTO.Resources}
        matrixOnClickHandler={() => console.log("Mock call to GEPPETTO.SceneController")}
        nodeType={null}
        linkWeight={null}
        linkType={this.linkType}
        library={null}
      />
    );
  }
}