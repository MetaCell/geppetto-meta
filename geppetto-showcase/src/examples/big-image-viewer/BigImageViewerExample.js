import React, { Component } from 'react';
import BigImageViewer from '@metacell/geppetto-meta-ui/big-image-viewer/BigImageViewer';
import { withStyles } from '@mui/material';

const styles = {
  bigImageViewer: {
    display: 'flex',
    alignItems: 'stretch',
    height: '800px',
    width: '800px',
  },
};

const data = `${window.location.origin}/assets/brain_mri.dzi`;

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
