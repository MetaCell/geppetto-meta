import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import ThreeDEngine from './threeDEngine/ThreeDEngine';
import { cameraControlsActions } from "../camera-controls/CameraControls";
import { selectionStrategies } from "./threeDEngine/SelectionManager";
import { withResizeDetector } from 'react-resize-detector';
import { Recorder } from "./captureManager/Recorder";
import { screenshot } from "./captureManager/Screenshoter";
import { captureControlsActions } from "../capture-controls/CaptureControls";

const styles = () => ({
  container: {
    height: '100%',
    width: '100%',
  },
});

class Canvas extends Component {
  constructor (props) {
    super(props);
    this.sceneRef = React.createRef();
    this.cameraControls = React.createRef();
    this.captureControls = React.createRef();
    this.state = { modelReady: false, showDownload: false }
    this.defaultCameraControlsHandler = this.defaultCameraControlsHandler.bind(this)
    this.defaultCaptureControlsHandler = this.defaultCaptureControlsHandler.bind(this)
  }

  async componentDidMount () {
    const {
      data,
      cameraOptions,
      cameraHandler,
      backgroundColor,
      pickingEnabled,
      linesThreshold,
      hoverListeners,
      setColorHandler,
      onMount,
      selectionStrategy,
      onSelection
    } = this.props;

    this.threeDEngine = new ThreeDEngine(
      this.sceneRef.current,
      cameraOptions,
      cameraHandler,
      onSelection,
      backgroundColor,
      pickingEnabled,
      linesThreshold,
      hoverListeners,
      setColorHandler,
      selectionStrategy
    );

    this.recorder = new Recorder(this.getCanvasElement())
    await this.threeDEngine.start(data, cameraOptions, true);
    onMount(this.threeDEngine.scene)
    this.setState({ modelReady: true })
    this.threeDEngine.requestFrame();
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.threeDEngine.resize();
    }

    if (prevProps !== this.props) {
      const { data, cameraOptions, threeDObjects } = this.props;
      await this.threeDEngine.update(data, cameraOptions, threeDObjects, this.shouldEngineTraverse());
      this.threeDEngine.requestFrame();
      this.setState({ modelReady: true })
    } else {
      this.setState({ modelReady: false })
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return nextState.modelReady || nextProps !== this.props || this.state.showDownload !== nextState.showDownload
  }

  componentWillUnmount () {
    this.threeDEngine.stop();
    this.sceneRef.current.removeChild(
      this.threeDEngine.getRenderer().domElement
    );
  }

  defaultCaptureControlsHandler (action) {
    if (this.recorder) {
      switch (action) {
      case captureControlsActions.START:
        this.recorder.startRecording()
        this.setState({ showDownload: false })
        break;
      case captureControlsActions.STOP:
        this.recorder.stopRecording()
        this.setState({ showDownload: true })
        break;
      case captureControlsActions.DOWNLOAD:
        this.recorder.download()
        break;
      }
    }
    if (action === captureControlsActions.SCREENSHOT && this.props.captureOptions && this.props.captureOptions.screenshotOptions) {
      const { quality, pixelRatio, resolution, filter } = this.props.captureOptions.screenshotOptions
      screenshot(this.getCanvasElement(), quality, resolution, pixelRatio, filter)
    }

  }

  defaultCameraControlsHandler (action) {
    const defaultProps = {
      incrementPan: {
        x: 0.01,
        y: 0.01
      },
      incrementRotation: {
        x: 0.01,
        y: 0.01,
        z: 0.01,
      },
      incrementZoom: 0.1,
      movieFilter: false,
    }
    const mergedProps = { ...defaultProps, ...this.props.cameraOptions.cameraControls }
    const { incrementPan, incrementRotation, incrementZoom, movieFilter } = mergedProps
    if (this.threeDEngine) {
      switch (action) {
      case cameraControlsActions.PAN_LEFT:
        this.threeDEngine.cameraManager.incrementCameraPan(-incrementPan.x, 0);
        break;
      case cameraControlsActions.PAN_RIGHT:
        this.threeDEngine.cameraManager.incrementCameraPan(incrementPan.x, 0);
        break;
      case cameraControlsActions.PAN_UP:
        this.threeDEngine.cameraManager.incrementCameraPan(0, -incrementPan.y);
        break;
      case cameraControlsActions.PAN_DOWN:
        this.threeDEngine.cameraManager.incrementCameraPan(0, incrementPan.y);
        break;
      case cameraControlsActions.ROTATE_UP:
        this.threeDEngine.cameraManager.incrementCameraRotate(0, incrementRotation.y, undefined);
        break;
      case cameraControlsActions.ROTATE_DOWN:
        this.threeDEngine.cameraManager.incrementCameraRotate(0, -incrementRotation.y, undefined);
        break;
      case cameraControlsActions.ROTATE_LEFT:
        this.threeDEngine.cameraManager.incrementCameraRotate(-incrementRotation.x, 0, undefined);
        break;
      case cameraControlsActions.ROTATE_RIGHT:
        this.threeDEngine.cameraManager.incrementCameraRotate(incrementRotation.x, 0, undefined);
        break;
      case cameraControlsActions.ROTATE_Z:
        this.threeDEngine.cameraManager.incrementCameraRotate(0, 0, incrementRotation.z);
        break;
      case cameraControlsActions.ROTATE_MZ:
        this.threeDEngine.cameraManager.incrementCameraRotate(0, 0, -incrementRotation.z);
        break;
      case cameraControlsActions.ROTATE:
        this.threeDEngine.cameraManager.autoRotate(movieFilter); // movie filter
        break;
      case cameraControlsActions.ZOOM_IN:
        this.threeDEngine.cameraManager.incrementCameraZoom(-incrementZoom);
        break;
      case cameraControlsActions.ZOOM_OUT:
        this.threeDEngine.cameraManager.incrementCameraZoom(incrementZoom);
        break;
      case cameraControlsActions.PAN_HOME:
        this.threeDEngine.cameraManager.resetCamera();
        break;
      case cameraControlsActions.WIREFRAME:
        this.threeDEngine.setWireframe(!this.threeDEngine.getWireframe());
        break;
      }
      this.threeDEngine.updateControls();
    }
  }

  getCanvasElement () {
    return this.sceneRef && this.sceneRef.current.getElementsByTagName('canvas')[0]
  }

  shouldEngineTraverse () {
    // TODO: check if new instance added, check if split meshes changed?
    return true;
  }

  render () {
    const { classes, cameraOptions, captureOptions } = this.props;
    const { showDownload } = this.state;
    const { cameraControls } = cameraOptions
    const { captureControls } = captureOptions
    const cameraControlsHandler = cameraControls.cameraControlsHandler ? cameraControls.cameraControlsHandler : this.defaultCameraControlsHandler
    const captureControlsHandler = captureControls.captureControlsHandler ? captureControls.captureControlsHandler : this.defaultCaptureControlsHandler
    const captureInstance = captureControls.instance ? (
      <captureControls.instance
        ref={this.captureControls}
        captureControlsHandler={captureControlsHandler}
        showDownload={showDownload}
        {...captureControls.props}
      />
    )
      : null;
    return (
      <div className={classes.container} ref={this.sceneRef}>
        {
          <cameraControls.instance
            ref={this.cameraControls}
            cameraControlsHandler={cameraControlsHandler}
            {...cameraControls.props}
          />
        }
        {captureInstance}

      </div>
    );
  }
}


Canvas.defaultProps = {
  cameraOptions: {
    angle: 50,
    near: 0.01,
    far: 1000,
    baseZoom: 1,
    reset: false,
    autorotate: false,
    wireframe: false,
    zoomTo: undefined,
    cameraControls: {
      instance: null,
      props: {},
    },
    rotateSpeed: 0.5,
  },
  captureOptions: {
    screenshotOptions: {
      resolution: {
        width: 3840,
        height: 2160,
      },
      quality: 0.95,
      pixelRatio: 1,
      filter: () => true
    },
    captureControls: {
      instance: null,
      props: {}
    }
  },
  backgroundColor: 0x000000,
  pickingEnabled: true,
  linesThreshold: 2000,
  hoverListeners: [],
  threeDObjects: [],
  cameraHandler: () => {
  },
  selectionStrategy: selectionStrategies.nearest,
  onSelection: () => {
  },
  setColorHandler: () => true,
  onMount: () => {
  },
  modelVersion: 0
};

Canvas.propTypes = {
  /**
   * (Proxy) Instances to visualize
   */
  data: PropTypes.array.isRequired,
  /**
   * Model identifier needed to propagate updates on async changes
   */
  modelVersion: PropTypes.number,
  /**
   * Options to customize camera
   */
  cameraOptions: PropTypes.object,
  /**
   * Options to customize capture features
   */
  captureOptions: PropTypes.object,
  /**
   * Three JS objects to add to the scene
   */
  threeDObjects: PropTypes.array,
  /**
   * Function to callback on camera changes
   */
  cameraHandler: PropTypes.func,
  /**
   * function to apply the selection strategy
   */
  selectionStrategy: PropTypes.func,
  /**
   * Function to callback on selection changes
   */
  onSelection: PropTypes.func,
  /**
   * Function to callback on set color changes. Return true to apply default behavior after or false otherwise
   */
  setColorHandler: PropTypes.func,
  /**
   * Function to callback on component did mount with scene
   */
  onMount: PropTypes.func,
  /**
   * Scene background color
   */
  backgroundColor: PropTypes.number,
  /**
   * Boolean to enable/disable 3d picking
   */
  pickingEnabled: PropTypes.bool,
  /**
   * Threshold to limit scene complexity
   */
  linesThreshold: PropTypes.number,
  /**
   * Array of hover handlers to callback
   */
  hoverListeners: PropTypes.array,
};

export default withResizeDetector(withStyles(styles)(Canvas));
