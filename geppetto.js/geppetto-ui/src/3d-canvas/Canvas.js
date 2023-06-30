import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import ThreeDEngine from './threeDEngine/ThreeDEngine';
import { cameraControlsActions } from "../camera-controls/CameraControls";
import CameraControls from "../camera-controls/CameraControls";
import { selectionStrategies } from "./threeDEngine/SelectionManager";
import ReactResizeDetector from 'react-resize-detector';
import { Recorder } from "./captureManager/Recorder";
import { downloadScreenshot } from "./captureManager/Screenshoter";
import { captureControlsActions } from "../capture-controls/CaptureControls";
import { hasDifferentProxyInstances, hasDifferentThreeDObjects } from "./threeDEngine/util";

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
    this.state = { isCanvasReady: false }
    this.constructorFromProps(props);
    this.onResize = this.onResize.bind(this);
    this.defaultCameraControlsHandler = this.defaultCameraControlsHandler.bind(this);
    this.defaultCaptureControlsHandler = this.defaultCaptureControlsHandler.bind(this)
    this.keyboardEventHandler = this.keyboardEventHandler.bind(this)
  }

  constructorFromProps (props) {
    if (props.captureOptions !== undefined) {
      this.captureControlsRef = React.createRef();
    }
  }

  async componentDidMount () {
    const {
      data,
      cameraOptions,
      captureOptions,
      cameraHandler,
      setColorHandler,
      backgroundColor,
      threeDObjects,
      pickingEnabled,
      linesThreshold,
      onSelection,
      selectionStrategy,
      onHoverListeners,
      onEmptyHoverListener,
      onMount,
      onUpdateStart,
      onUpdateEnd,
      dracoDecoderPath
    } = this.props;
    const hasCaptureOptions = captureOptions !== undefined

    this.threeDEngine = new ThreeDEngine(
      this.sceneRef.current,
      cameraOptions,
      cameraHandler,
      setColorHandler,
      backgroundColor,
      pickingEnabled,
      linesThreshold,
      onSelection,
      selectionStrategy,
      onHoverListeners,
      onEmptyHoverListener,
      hasCaptureOptions,
      dracoDecoderPath
    );
    onUpdateStart();
    await this.threeDEngine.updateInstances(data);
    this.threeDEngine.updateExternalThreeDObjects(threeDObjects)
    this.threeDEngine.updateCamera(cameraOptions);
    onUpdateEnd()
    onMount(this.threeDEngine.scene)

    if (hasCaptureOptions) {
      // todo captureOptions prop should force recorderOptions attribute
      this.recorder = new Recorder(this.getCanvasElement(), captureOptions.recorderOptions)
    }

    this.setState({ isCanvasReady: true })
    this.sceneRef.current.addEventListener('keydown', this.keyboardEventHandler)

  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    return nextState.isCanvasReady || this.isResizeRequired() || nextProps !== this.props
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {

    if (this.isResizeRequired()){
      this.threeDEngine.resize()
    }

    if (prevProps !== this.props) {
      const {
        data,
        cameraOptions,
        captureOptions,
        cameraHandler,
        setColorHandler,
        backgroundColor,
        threeDObjects,
        pickingEnabled,
        linesThreshold,
        onSelection,
        selectionStrategy,
        onHoverListeners,
        onEmptyHoverListener,
        onUpdateStart,
        onUpdateEnd,
      } = this.props;
      const {
        data: prevData,
        cameraOptions: prevCameraOptions,
        captureOptions: prevCaptureOptions,
        cameraHandler: prevCameraHandler,
        setColorHandler: prevSetColorHandler,
        backgroundColor: prevBackgroundColor,
        threeDObjects: prevThreeDObjects,
        pickingEnabled: prevPickingEnabled,
        linesThreshold: prevLinesThreshold,
        onSelection: prevOnSelection,
        selectionStrategy: prevSelectionStrategy,
        onHoverListeners: prevOnHoverListeners,
        onEmptyHoverListener: prevOnEmptyHoverListener
      } = prevProps;

      onUpdateStart();
      if (backgroundColor !== prevBackgroundColor){
        this.threeDEngine.setBackgroundColor(backgroundColor);
      }
      if (hasDifferentProxyInstances(data, prevData)) {
        await this.threeDEngine.updateInstances(data)
      }
      if (cameraOptions !== prevCameraOptions){
        this.threeDEngine.updateCamera(cameraOptions);
      }
      if (Object.keys(onHoverListeners).sort().toString() !== Object.keys(prevOnHoverListeners).sort().toString()){
        this.threeDEngine.setOnHoverListeners(onHoverListeners)
      }
      if (selectionStrategy !== prevSelectionStrategy){
        this.threeDEngine.setSelectionStrategy(selectionStrategy)
      }
      if (onSelection !== prevOnSelection){
        this.threeDEngine.setOnSelection(onSelection)
      }
      if (onEmptyHoverListener !== prevOnEmptyHoverListener){
        this.threeDEngine.setOnEmptyHoverListener(onEmptyHoverListener)
      }
      if (linesThreshold !== prevLinesThreshold){
        this.threeDEngine.setLinesThreshold(linesThreshold)
      }
      if (pickingEnabled !== prevPickingEnabled){
        this.threeDEngine.setPickingEnabled(pickingEnabled)
      }
      if (cameraHandler !== prevCameraHandler){
        this.threeDEngine.seCameraHandler(cameraHandler)
      }
      if (setColorHandler !== prevSetColorHandler){
        this.threeDEngine.setSetColorHandler(setColorHandler)
      }
      if (hasDifferentThreeDObjects(threeDObjects, prevThreeDObjects)){
        this.threeDEngine.updateExternalThreeDObjects(threeDObjects)
      }
      this.threeDEngine.requestFrame()
      onUpdateEnd()

      if (captureOptions !== prevCaptureOptions) {
        if (captureOptions !== undefined){
          this.recorder = new Recorder(this.getCanvasElement(), captureOptions.recorderOptions)
        } else {
          this.recorder = null
        }
      }
      this.setState({ isCanvasReady: true })
    } else {
      this.setState({ isCanvasReady: false })
    }
  }


  componentWillUnmount () {
    this.threeDEngine.stop();
    this.sceneRef.current.removeChild(
      this.threeDEngine.getRenderer().domElement
    );
    this.sceneRef.current.removeEventListener('keydown', this.keyboardEventHandler)
  }

  keyboardEventHandler (event){
    switch (event.code){
    case 'ArrowRight':
      this.defaultCameraControlsHandler(cameraControlsActions.PAN_RIGHT)
      break;
    case 'ArrowLeft':
      this.defaultCameraControlsHandler(cameraControlsActions.PAN_LEFT)
      break;
    case 'ArrowDown':
      this.defaultCameraControlsHandler(cameraControlsActions.PAN_DOWN)
      break;
    case 'ArrowUp':
      this.defaultCameraControlsHandler(cameraControlsActions.PAN_UP)
      break;

    }
  }

  isResizeRequired () {
    return this.sceneRef.current.clientWidth !== this.threeDEngine.width || this.sceneRef.current.clientHeight !== this.threeDEngine.height;
  }

  onResize (width, height, targetRef) {
    this.threeDEngine.resize();
  }

  getCanvasElement () {
    return this.sceneRef && this.sceneRef.current.getElementsByTagName('canvas')[0]
  }

  defaultCaptureControlsHandler (action) {
    const { captureOptions } = this.props
    if (this.recorder) {
      switch (action.type) {
      case captureControlsActions.START:
        this.recorder.startRecording()
        break
      case captureControlsActions.STOP:
        // eslint-disable-next-line no-case-declarations
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
      case captureControlsActions.DOWNLOAD_SCREENSHOT: {
        const { filename } = action.data;
        downloadScreenshot(this.getCanvasElement(), quality, resolution, pixelRatio, filter, filename)
        break
      }
      }
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
      incrementZoom: 0.01,
      movieFilter: false,
    }
    const mergedProps = { ...defaultProps, ...this.props.cameraOptions.cameraControls }
    const { incrementPan, incrementRotation, incrementZoom, movieFilter } = mergedProps
    const { initialPosition, initialRotation, initialZoomTo } = this.props.cameraOptions;
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
        this.threeDEngine.cameraManager.resetCamera(initialPosition, initialRotation, initialZoomTo);
        break;
      case cameraControlsActions.WIREFRAME:
        this.threeDEngine.setWireframe(!this.threeDEngine.getWireframe());
        break;
      }
      //this.threeDEngine.updateControls();
    }
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
          ref={this.captureControlsRef}
          {...captureControls.props}
          captureControlsHandler={captureControlsHandler}
        />
      )
        : null;
    }
    return (
      <ReactResizeDetector skipOnMount='true' onResize={this.onResize}>
        <div className={classes.container} ref={this.sceneRef} tabIndex={0}>
          {
            <cameraControls.instance
              ref={this.cameraControls}
              {...cameraControls.props}
              cameraControlsHandler={cameraControlsHandler}
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
    initialZoomTo: [],
    initialFlip: [],
    movieFilter: false,
    depthWrite: true,
    spotlightPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    cameraControls: {
      instance: CameraControls,
      props: { wireframeButtonEnabled: false, cameraControlsHandler: null, buttonStyles: { color: '#fc6320', }},
      incrementsPan: {
        x: 0.05,
        y: 0.05,
      },
      incrementRotation: {
        x: 0.05,
        y: 0.05,
        z:0.05,
      },
      incrementZoom: 0.5,
      reset: false,
    },
    trackballControls: {
      rotationSpeed: 0.5,
      zoomSpeed: 1.2,
      panSpeed: 0.3,
    }
  },
  captureOptions: {
    captureControls: {
      instance: null,
      props: { captureControlsHandler: null, buttonStyles: { color: '#fc6320', }},
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
    recorderOptions: {
      mediaRecorderOptions: { mimeType: 'video/webm', },
      blobOptions: { type: 'video/webm', }
    },
  },
  backgroundColor: 0x000000,
  pickingEnabled: true,
  linesThreshold: 2000,
  threeDObjects: [],
  cameraHandler: () => {},
  setColorHandler: () => true,
  onSelection: () => {},
  selectionStrategy: selectionStrategies.nearest,
  onHoverListeners: {},
  onMount: () => {},
  onUpdateStart: () => {},
  onUpdateEnd: () => {},
  dracoDecoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'
};

Canvas.propTypes = {
  /**
   * (Proxy) Instances to visualize
   */
  data: PropTypes.array.isRequired,
  /**
   * Options to customize camera
   */
  cameraOptions: PropTypes.shape({
    /**
     * Camera angle in canvas
     */
    angle: PropTypes.number,
    /**
     * Near value
     */
    near: PropTypes.number,
    /**
     * Far value
     */
    far: PropTypes.number,
    /**
     * Base zoom value
     */
    baseZoom: PropTypes.number,
    /**
     * Boolean to enable/disable reset
     */
    reset: PropTypes.bool,
    /**
     * Boolean to enable/disable auto rotate
     */
    autorotate: PropTypes.bool,
    /**
     * Boolean to enable/disable wireframe
     */
    wireframe: PropTypes.bool,
    /**
     * Objects to zoom into
     */
    initialZoomTo: PropTypes.arrayOf(PropTypes.string),
    /**
     * Array of axis to flip
     */
    initialFlip: PropTypes.arrayOf(PropTypes.string),
    /**
     * Rotation speed
     */
    rotationSpeed: PropTypes.number,
    /**
     * Boolean to enable/disable movie filter
     */
    movieFilter: PropTypes.bool,
    /**
     * Spotlight position object to define x, y, and z values
     */
    spotlightPosition: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    /**
     * Position object to define x, y, and z values
     */
    initialPosition: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      z: PropTypes.number,
    }),
    /**
     * Rotation object to define rx, ry, rz, and radius values
     */
    initialRotation: PropTypes.shape({
      rx: PropTypes.number,
      ry: PropTypes.number,
      rz: PropTypes.number,
      radius: PropTypes.number,
    }),
    /**
     * Options to customize camera controls
     */
    cameraControls: PropTypes.shape({
      /**
       * Reference to cameraControls instance
       */
      instance: PropTypes.elementType,
      /**
       * CameraControls props
       */
      props: PropTypes.shape({
          /**
           * Boolean to enable/disable wireframe button
           */
          wireframeButtonEnabled: PropTypes.bool,
          /**
           * Function to callback on camera controls changes
           */
          cameraControlsHandler: PropTypes.func,
          /**
           * Styles to apply on the icon button elements
           */
          buttonStyles: PropTypes.any
      }),
      /**
       * Value for pan increment
       */
      incrementPan: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
      }),
      /**
       * Value for rotation increment
       */
      incrementRotation: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
      }),
      /**
       * Value for zoom increment
       */
      incrementZoom: PropTypes.number,
      /**
       * Boolean to enable/disable reset
       */
      reset: PropTypes.bool,
    }),
    /**
     * Options to customize trackball controls
     */
    trackballControls: PropTypes.shape({
      /**
       * Value for the rotation speed triggered by the mouse
       */
      rotationSpeed: PropTypes.number,
      /**
       * Value for the zoom increment triggered by the mouse
       */
      zoomSpeed: PropTypes.number,
      /**
       * Value for the pan increment triggered by the mouse
       */
      panSpeed: PropTypes.number
    }),

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
      instance: PropTypes.elementType,
      /**
       * Component props
       */
      props: PropTypes.shape({
          /**
           * Styles to apply on the icon button elements
           */
          buttonStyles: PropTypes.any,
          /**
           * Function to callback on capture controls changes
           */
          captureControlsHandler: PropTypes.func,
      })
    }),
    /**
     * Recorder Options
     */
    recorderOptions: PropTypes.shape({
      /**
       * Media Recorder options
       */
      mediaRecorderOptions: PropTypes.shape({ mimeType: PropTypes.string, }),
      blobOptions: PropTypes.shape({ type: PropTypes.string, })
    }),
    /**
     * Screenshot Options
     */
    screenshotOptions: PropTypes.shape({
      /**
       * A function taking DOM node as argument. Should return true if passed node should be included in the output. Excluding node means excluding its children as well.
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
    })
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
   * Function to callback on set color changes. Return true to apply default behavior after or false otherwise
   */
  setColorHandler: PropTypes.func,
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
   * Map<string, function> of hover handlers to callback
   */
  onHoverListeners: PropTypes.object,
  /**
   * Function to callback on selection changes
   */
  onSelection: PropTypes.func,
  /**
   * Function to apply the selection strategy
   */
  selectionStrategy: PropTypes.func,
  /**
   * Function to callback on component did mount with scene obj
   */
  onMount: PropTypes.func,
  /**
   * Function to callback when the loading of elements of the canvas starts
   */
  onUpdateStart: PropTypes.func,
  /**
   * Function to callback when the loading of elements of the canvas ends
   */
  onUpdateEnd: PropTypes.func,
  /**
   * Path to the draco decoder
   */
  dracoDecoderPath: PropTypes.string
};

export default withStyles(styles)(Canvas);
