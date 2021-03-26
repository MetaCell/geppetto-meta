import React, { Component } from 'react';
import DicomViewer from '../../DicomViewer';
import Loader from "@geppettoengine/geppetto-ui/loader/Loader";

export default class DicomViewerExample extends Component {
  constructor (props) {
      super(props);
      this.state = {ready: true};
      this.onLoad = this.onLoad.bind(this)

  }

  componentDidMount() {
      this.setState({
          ready: false
      });
  }

    onLoad(){
      this.setState({
          ready: true
      });
  }

  render () {
    const data
      = 'https://s3.amazonaws.com/patient-hm-august-2017/MRI/IN+SITU+2008+MPRAGE+1MM-ISO/IN-SITU-2008-MPRAGE-1MM-ISO-ALT2.nii.gz';

    const {ready} = this.state

    return ready? (
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
          onCtrlClick="togglMode"
          showDownloadButton={true}
          onLoad={this.onLoad}
        />
      </div>
    ): <Loader/>
  }
}
