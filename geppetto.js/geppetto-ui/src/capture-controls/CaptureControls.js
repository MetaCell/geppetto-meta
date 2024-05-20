import React, { Component } from 'react';
import IconButtonWithTooltip from '../common/IconButtonWithTooltip';
import { faCamera, faDotCircle, faDownload, faStop } from '@fortawesome/free-solid-svg-icons';

import './CaptureControls.less';
import PropTypes from "prop-types";


export const captureControlsActions = {
  START: 'START',
  STOP: 'STOP',
  DOWNLOAD_VIDEO: 'DOWNLOAD_VIDEO',
  DOWNLOAD_SCREENSHOT: 'DOWNLOAD_SCREENSHOT',
};

export const captureControlsActionsStart = (() => ({ type: captureControlsActions.START, }));
export const captureControlsActionsStop = ((options) => ({
  type: captureControlsActions.STOP,
  data: { options:options },
}))
export const captureControlsActionsDownloadVideo = ((filename, options) => ({
  type: captureControlsActions.DOWNLOAD_VIDEO,
  data: { filename:filename, options:options },
}));
export const captureControlsActionsDownloadScreenshot = (filename => ({
  type: captureControlsActions.DOWNLOAD_SCREENSHOT,
  data: { filename:filename },
}));


class CaptureControls extends Component {
  constructor (props) {
    super(props);
    this.state = { isRecording: false, hasRecorded: false }
    this.handleClickRecord = this.handleClickRecord.bind(this)
  }

  handleClickRecord (){
    const { isRecording } = this.state;
    if (isRecording){
      this.props.captureControlsHandler(captureControlsActionsStop())
    } else {
      this.props.captureControlsHandler(captureControlsActionsStart())
    }
    this.setState({ isRecording: !isRecording, hasRecorded: true })
  }

  render () {
    const { buttonStyles, captureControlsHandler } = this.props;
    const { isRecording, hasRecorded } = this.state;

    const defaultButtonStyles = { color: '#fc6320', }
    const iconButtonStyles = buttonStyles ? buttonStyles : defaultButtonStyles

    const recordButton = !isRecording ? (
      <IconButtonWithTooltip
        disabled={false}
        onClick={this.handleClickRecord}
        className={`start squareB`}
        style={iconButtonStyles}
        tooltip={"Start Recording"}
        icon={faDotCircle}
      />
    ) 
      : (
        <IconButtonWithTooltip
          disabled={false}
          onClick={this.handleClickRecord}
          className={`stop squareB`}
          style={iconButtonStyles}
          tooltip={"Stop recording"}
          icon={faStop}
        />
      )
    
    return (
      <div className="position-toolbar">
        {recordButton}
        { hasRecorded && !isRecording
        && <IconButtonWithTooltip
          disabled={false}
          onClick={() => captureControlsHandler(captureControlsActionsDownloadVideo())}
          className={`download squareB`}
          style={iconButtonStyles}
          tooltip={"Download"}
          icon={faDownload}/>
        }
        <IconButtonWithTooltip
          disabled={false}
          onClick={() => captureControlsHandler(captureControlsActionsDownloadScreenshot())}
          className={`screenshot squareB`}
          style={iconButtonStyles}
          tooltip={"Screenshot"}
          icon={faCamera}/>
      </div>
    );
  }
}

CaptureControls.defaultProps = { };

CaptureControls.propTypes = {
  /**
   * Function to callback on capture controls changes
   */
  captureControlsHandler: PropTypes.func.isRequired,
  /**
   * Styles to apply on the icon button elements
   */
  buttonStyles: PropTypes.any,

};

export default CaptureControls;