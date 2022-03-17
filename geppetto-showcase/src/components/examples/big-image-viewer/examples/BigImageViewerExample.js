import React, { Component } from 'react';
// import BigImageViewer from '../../BigImageViewer';
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

const data = 'https://s3.amazonaws.com/patient-hm-august-2017/Histology/HM_1243_FLIPPED_DZ_tif.dzi';

class BigImageViewerExample extends Component {

  render () {
    const { classes } = this.props;
    return (
      <div style={{ position: 'relative' }} className={classes.bigImageViewer}>
        <BigImageViewer id="BigImageViewerContainer" data={data} />
      </div>
    );
  }
}

export default withStyles(styles)(BigImageViewerExample);
