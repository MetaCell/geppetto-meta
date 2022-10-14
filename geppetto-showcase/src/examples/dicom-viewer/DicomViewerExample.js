import React, { Component } from 'react';
import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";

export default class DicomViewerExample extends Component {
  constructor (props) {
    super(props);
    this.state = { ready: true };
    this.onLoaded = this.onLoaded.bind(this)

  }

  componentDidMount () {
    this.setState({ ready: false });
  }

  onLoaded (){
    this.setState({ ready: true });
  }

  render () {
    const data
      = '../assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz';

    const { ready } = this.state

    return ready ? (
      <div
        style={{
          position: 'relative',
          height: '800px',
          width: '1000px',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <DicomViewer
          id="DicomViewerContainer"
          mode={'quad_view'}
          data={data}
          onShiftClick="goToPoint"
          onCtrlClick="toggleMode"
          showDownloadButton={true}
          onLoaded={this.onLoaded}
        />
      </div>
    ) : <Loader/>
  }
}
