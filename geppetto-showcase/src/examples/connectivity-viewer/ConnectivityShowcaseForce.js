import React, { Component } from 'react';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import Resources from '@metacell/geppetto-meta-core/Resources';
import model from './model';
import { Force } from '@metacell/geppetto-meta-ui/connectivity-viewer/layouts/Force';
import ConnectivityComponent from '@metacell/geppetto-meta-ui/connectivity-viewer/ConnectivityComponent';
import { withStyles } from '@mui/material';

const styles = {
  connectivity: {
    display: 'flex',
    alignItems: 'stretch',
    height: '600px',
    width: '500px',
  },
};

class ConnectivityShowcaseForce extends Component {
  constructor (props) {
    super(props);
    Manager.loadModel(model);
    this.linkType = this.linkType.bind(this);
  }

  linkType (c) {
    return ModelFactory.getAllVariablesOfType(
      c.getParent(),
      ModelFactory.geppettoModel.neuroml.synapse
    )[0].getId();
  }

  matrixHandler = () => {
    console.warn('Mock call to SceneController')
    console.trace()
  }

  render () {
    const data = Instances[0];
    const layout = new Force();
    const colors = ['#cb0000', '#003398'];
    const names = ['pyramidals_48', 'baskets_12'];
    const { classes } = this.props;

    return (
      <div className={classes.connectivity}>
        <ConnectivityComponent
          id="ConnectivityContainerForce"
          data={data}
          colors={colors}
          names={names}
          layout={layout}
          modelFactory={ModelFactory}
          resources={Resources}
          matrixOnClickHandler={this.matrixHandler}
          nodeType={null}
          linkWeight={null}
          linkType={this.linkType}
          library={null}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ConnectivityShowcaseForce);
