import React, { Component } from 'react';
import BigImageViewer from '@metacell/geppetto-meta-ui/big-image-viewer/BigImageViewer';
import { withStyles } from '@material-ui/core';

const styles = {
  bigImageViewer: {
    display: 'flex',
    alignItems: 'stretch',
    height: '800px',
    width: '800px',
  },
};

// TODO: Update to a neuroscience example
const data = 'https://raw.githubusercontent.com/openseadragon/openseadragon/a6792138814d1eff5ae4fca526b989fc917245be/test/data/wide.dzi';

class BigImageViewerExample extends Component {

  render () {
    const { classes } = this.props;
    return (
      <div style={{ position: 'relative' }} className={classes.bigImageViewer}>
        <BigImageViewer id="BigImageViewerContainer" data={data}
          toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0);' } }}/>
      </div>
    );
  }
}

export default withStyles(styles)(BigImageViewerExample);
