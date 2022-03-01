import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import ThreeDEngine from './threeDEngine/ThreeDEngine';
import { cameraControlsActions } from "../camera-controls/CameraControls";
import { selectionStrategies } from "./threeDEngine/SelectionManager";
import ReactResizeDetector from 'react-resize-detector';
import { Recorder } from "./captureManager/Recorder";
import { downloadScreenshot } from "./captureManager/Screenshoter";
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
    this.state = { modelReady: false }
    this.constructorFromProps(props);
    this.frameResizing = this.frameResizing.bind(this);
    this.defaultCameraControlsHandler = this.defaultCameraControlsHandler.bind(this);
    this.defaultCaptureControlsHandler = this.defaultCaptureControlsHandler.bind(this);
  }

  constructorFromProps (props) {
    if (props.captureOptions !== undefined) {
      this.captureControls = React.createRef();
    }
  }

  async componentDidMount () {
    const {
      data,
      cameraOptions,
      cameraHandler,
      captureOptions,
      backgroundColor,
      pickingEnabled,
      linesThreshold,
      hoverListeners,
      setColorHandler,
      onMount,
      selectionStrategy,
      onSelection,
      updateStarted,
      updateEnded
    } = this.props;

    this.threeDEngine = new ThreeDEngine(
      this.sceneRef.current,
      cameraOptions,
      cameraHandler,
      captureOptions,
      onSelection,
      backgroundColor,
      pickingEnabled,
      linesThreshold,
      hoverListeners,
      setColorHandler,
      selectionStrategy,
      updateStarted,
      updateEnded,
    );

    if (captureOptions) {
      this.recorder = new Recorder(this.getCanvasElement(), captureOptions.recorderOptions)
    }
    await this.threeDEngine.start(data, cameraOptions, true);
    onMount(this.threeDEngine.scene)
    this.setState({ modelReady: true })
    this.threeDEngine.requestFrame();
    this.threeDEngine.setBackgroundColor(backgroundColor);
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps !== this.props) {
      const { data, cameraOptions, threeDObjects, backgroundColor } = this.props;
      await this.threeDEngine.update(data, cameraOptions, threeDObjects, this.shouldEngineTraverse(), backgroundColor);
      this.threeDEngine.requestFrame();
      this.setState({ modelReady: true })
    } else {
      this.setState({ modelReady: false })
    }
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return nextState.modelReady || nextProps !== this.props
  }

  componentWillUnmount () {
    this.threeDEngine.stop();
    this.sceneRef.current.removeChild(
      this.threeDEngine.getRenderer().domElement
    );
  }

  defaultCaptureControlsHandler (action) {
    const { captureOptions } = this.props
    if (this.recorder) {
      switch (action.type) {
      case captureControlsActions.START:
        this.recorder.startRecording()
        break
      case captureControlsActions.STOP:
        const { options } = action.data;
        return this.recorder.stopRecording(options)
      case captureControlsActions.DOWNLOAD_VIDEO: {
        const { filename, options } = action.data;
        return this.recorder.download(filename, options)
      }
      }
    }
    if (captureOptions && captureOptions.screenshotOptions) {
      const { quality, pixelRatio, resolution, filter } = captureOptions.screenshotOptions
      switch (action.type) {
      case captureControlsActions.DOWNLOAD_SCREENSHOT:{
        const { filename } = action.data;
        downloadScreenshot(this.getCanvasElement(), quality, resolution, pixelRatio, filter, filename)
        break
      }
      }
    }
  }

  defaultCameraControlsHandler (action) {
    const defaultProps = {
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

  frameResizing(width, height, targetRef) {
    this.threeDEngine.resize();
  }

  render () {
    const { classes, cameraOptions, captureOptions } = this.props;
    const { cameraControls } = cameraOptions
    const cameraControlsHandler = cameraControls.cameraControlsHandler ? cameraControls.cameraControlsHandler : this.defaultCameraControlsHandler
    let captureInstance = null
    if (captureOptions) {
      const { captureControls } = captureOptions
      const captureControlsHandler = captureControls && captureControls.captureControlsHandler ? captureControls.captureControlsHandler : this.defaultCaptureControlsHandler
      captureInstance = captureControls && captureControls.instance ? (
        <captureControls.instance
          ref={this.captureControls}
          captureControlsHandler={captureControlsHandler}
          {...captureControls.props}
        />
      )
        : null;
    }
    return (
      <ReactResizeDetector skipOnMount='true' onResize={this.frameResizing}>
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
      </ReactResizeDetector>
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
    depthWrite: true,
    zoomTo: undefined,
    cameraControls: {
      instance: null,
      props: {},
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
    },
    rotateSpeed: 0.5,
  },
  captureOptions: undefined,
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
  modelVersion: 0,
  updateStarted: () => {
  },
  updateEnded: () => {
  },
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
  cameraOptions: PropTypes.shape({
    angle:PropTypes.number,
    near:PropTypes.number,
    far:PropTypes.number,
    baseZoom:PropTypes.number,
    reset:PropTypes.bool,
    autoRotate:PropTypes.bool,
    wireframe:PropTypes.bool,
    depthWrite:PropTypes.bool,
    zoomTo:PropTypes.any,

    /**
     * Camera control component definition 
     */
    cameraControls:PropTypes.shape({
      /**
       * Component instance 
       */
      instance:PropTypes.any,
      /**
       * Component props
       */
      props:PropTypes.object,
      incrementPan:PropTypes.shape({
        x:PropTypes.number,
        y:PropTypes.number,
      }),
      incrementRotation:PropTypes.shape({
        x:PropTypes.number,
        y:PropTypes.number,
        z:PropTypes.number
      }),
      incrementZoom:PropTypes.number,
    }),
    rotateSpeed:PropTypes.number
  }),
  /**
   * Options to customize capture features
   */
  captureOptions: PropTypes.shape({
    /**
     * Capture controls component definition
     */
    captureControls: PropTypes.shape({
      /**
       * Component instance
       */
      instance: PropTypes.any,
      /**
       * Component props
       */
      props: PropTypes.shape({})
    }),
    /**
     * Recorder Options
     */
    recorderOptions: PropTypes.shape({
      /**
       * Media Recorder options
       */
      mediaRecorderOptions: PropTypes.shape({
        mimeType: PropTypes.string,
      }),
      blobOptions: PropTypes.shape({
        type: PropTypes.string,
      })
    }),
    /**
     * Screenshot Options
     */
    screenshotOptions: PropTypes.shape({
      /**
       * A function taking DOM node as argument. Should return true if passed node should be included in the output. Excluding node means excluding it's children as well.
       */
      filter: PropTypes.func,
      /**
       * The pixel ratio of the captured image. Default use the actual pixel ratio of the device. Set 1 to use as initial-scale 1 for the image.
       */
      pixelRatio: PropTypes.number,
      /**
       * A number between 0 and 1 indicating image quality (e.g. 0.92 => 92%) of the JPEG image.
       */
      quality: PropTypes.number,
      /**
       * Screenshot desired resolution
       */
      resolution: PropTypes.shape({
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired
      })
    }).isRequired
  }),
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
  /**
   * Function to callback when the loading of elements of the canvas starts
   */
  updateStarted: PropTypes.func,
  /**
   * Function to callback when the loading of elements of the canvas ends
   */
  updateEnded: PropTypes.func,
};

export default withStyles(styles)(Canvas);
