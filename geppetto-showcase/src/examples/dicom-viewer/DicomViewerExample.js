import React, { Component } from 'react';
import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import {
  faThLarge,
  faSquare,
  faExchangeAlt,
  faDownload,
  faExpandAlt,
  faCompressAlt,
} from '@fortawesome/free-solid-svg-icons';

export default class DicomViewerExample extends Component {
  constructor (props) {
    super(props);
    this.state = { ready: true, fullscreen: false, mode: 'quad_view', orientation: '3d' };
    this.onLoaded = this.onLoaded.bind(this)
    this.changeMode = this.changeMode.bind(this)
    this.changeOrientation = this.changeOrientation.bind(this)
    this.restore = this.restore.bind(this)
    this.fullScreen = this.fullScreen.bind(this)
  }

  componentDidMount () {
    this.setState({ ...this.state, ready: false });
  }

  onLoaded (){
    this.setState({ ...this.state, ready: true });
  }

  changeMode () {
    if (this.state.mode === 'single_view') {
      this.setState({ ...this.state, mode: 'quad_view' });
    } else {
      this.setState({ ...this.state, mode: 'single_view' });
    }
  }

  changeOrientation () {
    let newOrientation;
    switch (this.state.orientation) {
    case 'coronal':
      newOrientation = 'sagittal';
      break;
    case 'sagittal':
      newOrientation = 'axial';
      break;
    case 'axial':
      newOrientation = '3d';
      break;
    case '3d':
    default:
      newOrientation = 'coronal';
      break;
    }
    this.setState({ ...this.state, orientation: newOrientation });
  }

  restore () {
    this.setState({ ...this.state, fullScreen: false });
  }

  fullScreen () {
    this.setState({ ...this.state, fullScreen: true });
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
          mode={this.state.mode}
          fullScreen={this.state.fullScreen}
          orientation={this.state.orientation}
          data={data}
          onShiftClick="goToPoint"
          onCtrlClick="toggleMode"
          onRightClick={event => console.log("Right click!", event)}
          showDownloadButton={true}
          onLoaded={this.onLoaded}
          toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0);' } }}
          toolbarButtons={{
            single_view: [
              { icon: faThLarge, tooltip: 'Multi View', action: this.changeMode },
              { icon: faExchangeAlt, tooltip: 'Change Orientation', action: this.changeOrientation }
            ],
            quad_view: [
              { icon: faSquare, tooltip: 'Single View', action: this.changeMode }
            ],
            fullScreen: [
              { icon: faCompressAlt, tooltip: 'Restore', action: this.restore }
            ],
            minimized: [
              { icon: faExpandAlt, tooltip: 'Maximize', action: this.fullScreen }
            ]
          }}
        />
      </div>
    ) : <Loader/>
  }
}