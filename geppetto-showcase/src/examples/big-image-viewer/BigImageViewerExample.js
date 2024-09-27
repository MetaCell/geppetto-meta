import React, { Component } from 'react';
import BigImageViewer from '@metacell/geppetto-meta-ui/big-image-viewer/BigImageViewer';

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
    return (
      <div style={{ position: 'relative' }} sx={styles.bigImageViewer}>
        <BigImageViewer id="BigImageViewerContainer" data={data}
          toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0);' } }}/>
      </div>
    );
  }
}

export default BigImageViewerExample;
