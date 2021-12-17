import React, { Component } from 'react';
import IconButtonWithTooltip from '../common/IconButtonWithTooltip';
import { withStyles } from '@material-ui/core';
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
export const captureControlsActionsStop = (() => ({ type: captureControlsActions.STOP, }));
export const captureControlsActionsDownloadVideo = (filename => ({
  type: captureControlsActions.DOWNLOAD_VIDEO,
  data: { filename:filename },
}));
export const captureControlsActionsDownloadScreenshot = (filename => ({
  type: captureControlsActions.DOWNLOAD_SCREENSHOT,
  data: { filename:filename },
}));


const styles = theme => ({ button: { color: theme.palette.button.main, }, });

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
    const { classes, captureControlsHandler } = this.props;
    const { isRecording, hasRecorded } = this.state;

    const recordButton = !isRecording ? (
      <IconButtonWithTooltip
        disabled={false}
        onClick={this.handleClickRecord}
        className={`${classes.button} start squareB`}
        tooltip={"Start Recording"}
        icon={faDotCircle}
      />
    ) 
      : (
        <IconButtonWithTooltip
          disabled={false}
          onClick={this.handleClickRecord}
          className={`${classes.button} stop squareB`}
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
          className={`${classes.button} download squareB`}
          tooltip={"Download"}
          icon={faDownload}/>
        }
        <IconButtonWithTooltip
          disabled={false}
          onClick={() => captureControlsHandler(captureControlsActionsDownloadScreenshot())}
          className={`${classes.button} screenshot squareB`}
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

};

export default withStyles(styles)(CaptureControls);