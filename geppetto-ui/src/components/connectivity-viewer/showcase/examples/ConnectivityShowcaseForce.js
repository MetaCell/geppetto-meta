import React, { Component } from 'react';
import model from '../model.json';
import { Force } from '../../layouts/Force';
import ConnectivityComponent from '../../ConnectivityComponent';

export default class ConnectivityShowcaseForce extends Component {
  constructor (props) {
    super(props);
    GEPPETTO.Manager.loadModel(model);
    this.linkType = this.linkType.bind(this);
  }

  linkType (c) {
    return GEPPETTO.ModelFactory.getAllVariablesOfType(
      c.getParent(),
      GEPPETTO.ModelFactory.geppettoModel.neuroml.synapse
    )[0].getId();
  }

  render () {
    const data = Instances[0];
    const layout = new Force();
    const colors = ['#cb0000', '#003398'];
    const names = ['pyramidals_48', 'baskets_12'];
    const size = { width: 600, height: 500 };

    return (
      <div style={size}>
        <ConnectivityComponent
          id="ConnectivityContainerForce"
          size={size}
          data={data}
          colors={colors}
          names={names}
          layout={layout}
          modelFactory={GEPPETTO.ModelFactory}
          resources={GEPPETTO.Resources}
          matrixOnClickHandler={() =>
            console.log('Mock call to GEPPETTO.SceneController')
          }
          nodeType={null}
          linkWeight={null}
          linkType={this.linkType}
          library={null}
        />
      </div>
    );
  }
}
