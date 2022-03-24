import React, { Component } from 'react';
// import { Matrix } from '../../layouts/Matrix';
import { Matrix } from '@metacell/geppetto-meta-ui/connectivity-viewer/layouts/Matrix';
// import ConnectivityComponent from '../../ConnectivityComponent';
import ConnectivityComponent from '@metacell/geppetto-meta-ui/connectivity-viewer/ConnectivityComponent';
import { withStyles } from '@material-ui/core';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import Resources from '@metacell/geppetto-meta-core/Resources';

const styles = {
  connectivity: {
    display: 'flex',
    alignItems: 'stretch',
    height: '600px',
    width: '500px',
  },
};

class ConnectivityShowcaseMatrix extends Component {
  constructor (props) {
    super(props);
    // Manager.loadModel(model);
    this.linkType = this.linkType.bind(this);
  }

  matrixHandler = () => {
    console.log('Mock call to SceneController')
  }

  linkType (c) {
    return ModelFactory.getAllVariablesOfType(
      c.getParent(),
      ModelFactory.geppettoModel.neuroml.synapse
    )[0].getId();
  }

  render () {
    const data = Instances[0];
    const layout = new Matrix();
    const colors = ['#cb0000', '#003398'];
    const names = ['pyramidals_48', 'baskets_12'];
    const { classes } = this.props;

    return (
      <div className={classes.connectivity}>
        <ConnectivityComponent
          id="ConnectivityContainerMatrix"
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

export default withStyles(styles)(ConnectivityShowcaseMatrix);
