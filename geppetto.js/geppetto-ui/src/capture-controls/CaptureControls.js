import React, { Component } from 'react';
import IconButtonWithTooltip from '../common/IconButtonWithTooltip';
import { withStyles } from '@material-ui/core';
import { faDotCircle, faDownload, faStop } from '@fortawesome/free-solid-svg-icons';

import './CaptureControls.less';
import PropTypes from "prop-types";


export const captureControlsActions = {
  START: 'START',
  STOP: 'STOP',
  DOWNLOAD: 'DOWNLOAD',
};

const styles = theme => ({ button: { color: theme.palette.button.main, }, });

class CaptureControls extends Component {
  constructor (props) {
    super(props);
    this.state = { isRecording: false }
    this.handleClickRecord = this.handleClickRecord.bind(this)
  }

  handleClickRecord (){
    const { isRecording } = this.state;
    if (isRecording){
      this.props.captureControlsHandler(captureControlsActions.STOP)
    } else {
      this.props.captureControlsHandler(captureControlsActions.START)
    }
    this.setState({ isRecording: !isRecording })
  }

  render () {
    const { classes, showDownload, captureControlsHandler } = this.props;
    const { isRecording } = this.state;

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
        { showDownload 
        && <IconButtonWithTooltip
          disabled={false}
          onClick={() => captureControlsHandler(captureControlsActions.DOWNLOAD)}
          className={`${classes.button} download squareB`}
          tooltip={"Download"}
          icon={faDownload}/>
        }
      </div>
    );
  }
}

CaptureControls.defaultProps = { showDownload: false };

CaptureControls.propTypes = {
  /**
   * Function to callback on capture controls changes
   */
  captureControlsHandler: PropTypes.func.isRequired,

  /**
   * Boolean to enable/disable download button
   */
  showDownload: PropTypes.bool,
};

export default withStyles(styles)(CaptureControls);