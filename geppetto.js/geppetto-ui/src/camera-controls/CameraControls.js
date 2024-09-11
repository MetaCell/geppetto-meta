import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import IconButtonWithTooltip from '../common/IconButtonWithTooltip';
import {
  faChevronLeft,
  faChevronUp,
  faChevronRight,
  faChevronDown,
  faHome,
  faUndo,
  faRedo,
  faVideo,
  faSearchPlus,
  faSearchMinus
} from '@fortawesome/free-solid-svg-icons';

import './CameraControls.less';

export const cameraControlsActions = {
  PAN_LEFT: 'panLeft',
  PAN_UP: 'panUp',
  PAN_RIGHT: 'panRight',
  PAN_DOWN: 'panDown',
  PAN_HOME: 'cameraHome',
  ROTATE_LEFT: 'rotateLeft',
  ROTATE_UP: 'rotateUp',
  ROTATE_RIGHT: 'rotateRight',
  ROTATE_DOWN: 'rotateDown',
  ROTATE_Z: 'rotateZ',
  ROTATE_MZ: 'rotateMZ',
  ROTATE: 'rotate',
  ZOOM_IN: 'zoomIn',
  ZOOM_OUT: 'zoomOut',
  WIREFRAME: 'wireframe',
};


class CameraControls extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    const {
      cameraControlsHandler,
      wireframeButtonEnabled,
      buttonStyles
    } = this.props;
    const buttons = [
      {
        action: cameraControlsActions.PAN_LEFT,
        className: 'pan-left',
        tooltip: 'Pan left',
        icon: faChevronLeft,
      },
      {
        action: cameraControlsActions.PAN_RIGHT,
        className: 'pan-right',
        tooltip: 'Pan right',
        icon: faChevronRight,
      },
      {
        action: cameraControlsActions.PAN_UP,
        className: 'pan-top',
        tooltip: 'Pan up',
        icon: faChevronUp,
      },
      {
        action: cameraControlsActions.PAN_DOWN,
        className: 'pan-bottom',
        tooltip: 'Pan down',
        icon: faChevronDown,
      },
      {
        action: cameraControlsActions.PAN_HOME,
        className: 'pan-home',
        tooltip: 'Pan home',
        icon: faHome,
      },
      {
        action: cameraControlsActions.ROTATE_LEFT,
        className: 'rotate-left',
        tooltip: 'Rotate left',
        icon: faUndo,
      },
      {
        action: cameraControlsActions.ROTATE_RIGHT,
        className: 'rotate-right',
        tooltip: 'Rotate right',
        icon: faRedo,
      },
      {
        action: cameraControlsActions.ROTATE_UP,
        className: 'rotate-top rotate90',
        tooltip: 'Rotate up',
        icon: faUndo,
      },
      {
        action: cameraControlsActions.ROTATE_DOWN,
        className: 'rotate-bottom rotate90',
        tooltip: 'Rotate down',
        icon: faRedo,
      },
      {
        action: cameraControlsActions.ROTATE,
        className: 'auto-rotate',
        tooltip: 'Auto-Rotate',
        icon: faVideo,
      },
      {
        action: cameraControlsActions.ROTATE_MZ,
        className: 'rotate-mz',
        tooltip: 'Rotate mz',
        icon: faRedo,
      },
      {
        action: cameraControlsActions.ROTATE_Z,
        className: 'rotate-z',
        tooltip: 'Rotate z',
        icon: faUndo,
      },
      {
        action: cameraControlsActions.ZOOM_IN,
        className: 'zoom-in',
        tooltip: 'Zoom in',
        icon: faSearchPlus,
      },
      {
        action: cameraControlsActions.ZOOM_OUT,
        className: 'zoom-out',
        tooltip: 'Zoom out',
        icon: faSearchMinus,
      },
    ];

    if (wireframeButtonEnabled) {
      buttons.push({
        action: cameraControlsActions.WIREFRAME,
        className: 'gpt-sphere_wireframe-jpg wireframe',
        tooltip: 'Toggle wireframe',
        icon: null,
      });
    }

    const defaultButtonStyles = { color: '#fc6320', }
    const iconButtonStyles = buttonStyles ? buttonStyles : defaultButtonStyles


    return (
      <div className="position-toolbar">
        {buttons.map((value, index) => (
          <IconButtonWithTooltip
            key={index}
            disabled={false}
            onClick={() => cameraControlsHandler(value.action)}
            className={`${value.className} squareB`}
            style={iconButtonStyles}
            tooltip={value.tooltip}
            icon={value.icon}
          />
        ))}
      </div>
    );
  }
}

CameraControls.defaultProps = { wireframeButtonEnabled: false };

CameraControls.propTypes = {
  /**
   * Function to callback on camera controls changes
   */
  cameraControlsHandler: PropTypes.func.isRequired,

  /**
   * Boolean to enable/disable wireframe button
   */
  wireframeButtonEnabled: PropTypes.bool,

  /**
   * Styles to apply on the icon button elements
   */
  buttonStyles: PropTypes.any,
};

export default CameraControls;