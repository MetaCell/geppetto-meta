import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import * as THREE from 'three';
import DicomViewerUtils from './DicomViewerUtils';
import { offset } from '../utilities';
import { boundingBoxHelperFactory, VolumeLoader, StackModel } from 'ami.js';
const HelpersBoundingBox = boundingBoxHelperFactory(THREE);

import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomToolbar from '../common/CustomToolbar';
import { createZipFromRemoteFiles } from './util';
import Loader from "../loader/Loader";

const classes = {
  dicomViewer: "dicom-viewer",
  renderer: "dicom-viewer-renderer",
  toolbar: "dicom-viewer-toolbar",
  toolbarBox: "dicom-viewer-toolbar-box",
  button: "dicom-viewer-button",
};

class DicomViewer extends Component {

  animationOn = true;
  animationSkipRate = 3;

  constructor (props) {
    super(props);

    // 3d renderer
    this.r0 = {
      domClass: 'r0',
      domElement: null,
      renderer: null,
      color: 0x212121,
      targetID: 0,
      camera: null,
      controls: null,
      scene: null,
      light: null,
      parent: this,
    };

    // 2d axial renderer
    this.r1 = {
      domClass: 'r1',
      domElement: null,
      renderer: null,
      color: 0x121212,
      sliceOrientation: 'axial',
      sliceColor: 0xff1744,
      targetID: 1,
      camera: null,
      controls: null,
      scene: null,
      light: null,
      stackHelper: null,
      localizerHelper: null,
      localizerScene: null,
      widgets: [],
      parent: this,
    };

    // 2d sagittal renderer
    this.r2 = {
      domClass: 'r2',
      domElement: null,
      renderer: null,
      color: 0x121212,
      sliceOrientation: 'sagittal',
      sliceColor: 0xffea00,
      targetID: 2,
      camera: null,
      controls: null,
      scene: null,
      light: null,
      stackHelper: null,
      localizerHelper: null,
      localizerScene: null,
      widgets: [],
      parent: this,
    };

    // 2d coronal renderer
    this.r3 = {
      domClass: 'r3',
      domElement: null,
      renderer: null,
      color: 0x121212,
      sliceOrientation: 'coronal',
      sliceColor: 0x76ff03,
      targetID: 3,
      camera: null,
      controls: null,
      scene: null,
      light: null,
      stackHelper: null,
      localizerHelper: null,
      localizerScene: null,
      widgets: [],
      parent: this,
    };

    this.state = { ready: false }

    this.containerRef = React.createRef();

    this.onRender = this.props.onRender;
    this.drag = false;
    this.animationSkipRate = this.props.animationSkipRate || 3;

    this.startAnimation = this.startAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.centerOn = this.centerOn.bind(this);
  }

  extractFilesPath (data) {
    if (!data) {
      return undefined;
    }
    if (!data.getMetaType) {
      return data;
    }
    if (data.getMetaType() === 'Instance') {
      const value = data.getVariable().getInitialValues()[0].value;
      switch (value.format){
      case 'NIFTI':
        return value.data
      case 'DCM':
        break; // todo: what do we do here?
      }
    }
    return undefined;
  }

  loadModel (modelData) {
    const data = this.extractFilesPath(modelData)
    if (!data) {
      return
    }

    this.ready = false
    const _this = this;

    let animationCount = 0;
    /**
     * Init the view
     */
    function init () {
      /**
       * Called on each animation frame
       */
      function animate () {
        if ( _this.ready && _this.animationOn && animationCount++ % _this.animationSkipRate === 0) {
          // we are ready when both meshes have been loaded
          const { mode, orientation } = _this.props;
          const shouldRenderPlane = plane => mode === 'quad_view' || orientation === plane;
          const shouldRender3D = shouldRenderPlane('3d');

          const planesSetup = {
            'r1': 'sagittal',
            'r2': 'axial',
            'r3': 'coronal'
          };

          if (shouldRender3D) {
            // render
            _this.r0.controls.update();
            _this.r0.light.position.copy(_this.r0.camera.position);
            _this.r0.renderer.render(_this.r0.scene, _this.r0.camera);
            _this.r0.scene.background = new THREE.Color("#353535");
          }

          for (const [planeName, planeOrientation] of Object.entries(planesSetup)) {
            if (!shouldRenderPlane(planeOrientation)) {
              continue
            }
            const plane = _this[planeName]
            const camera = plane.camera
            const renderer = plane.renderer
            plane.controls.update();

            // clear renderer
            renderer.clear();

            plane.renderer.render(plane.scene, camera);
            plane.scene.background = new THREE.Color("#353535");

            // localizer
            renderer.clearDepth();
            renderer.render(
              plane.localizerScene,
              camera
            );

            // Widgets
            for (const widget of plane.widgets) {
              widget.update();
            }
          }

          if (_this.onRender) {
            _this.onRender([_this.r0, _this.r1, _this.r2, _this.r3]);
          }
        }

        // request new frame
        requestAnimationFrame(animate);
      }

      // renderers
      DicomViewerUtils.initRenderer3D(_this.r0, _this.containerRef.current);
      DicomViewerUtils.initRenderer2D(_this.r1, _this.containerRef.current);
      DicomViewerUtils.initRenderer2D(_this.r2, _this.containerRef.current);
      DicomViewerUtils.initRenderer2D(_this.r3, _this.containerRef.current);

      // start rendering loop
      animate();
    }

    // init threeJS
    init();

    /*
     * load sequence for each file
     * instantiate the loader
     * it loads and parses the dicom image
     */
    let loader = new VolumeLoader();
    loader
      .load(this.extractFilesPath(data))
      .then(() => {
        const { applySegmentationLUT } = _this.props;

        const series = loader.data[0].mergeSeries(loader.data)[0];
        loader.free();
        loader = null;
        // get first stack from series
        const stack = series.stack[0];
        stack.prepare();

        // center 3d camera/control on the stack
        const centerLPS = stack.worldCenter();
        _this.r0.camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
        _this.r0.camera.updateProjectionMatrix();
        _this.r0.controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

        // bouding box
        const boxHelper = new HelpersBoundingBox(stack);
        _this.r0.scene.add(boxHelper);

        // Init the 2D planes stack helpers
        DicomViewerUtils.initHelpersStack(_this.r1, stack);
        DicomViewerUtils.initHelpersStack(_this.r2, stack);
        DicomViewerUtils.initHelpersStack(_this.r3, stack);

        // Init the 2D planes segmentation LUT if necessary
        if (applySegmentationLUT) {
          DicomViewerUtils.initSegmentationLUT(_this.r1, stack, _this.r1.stackHelper);
          DicomViewerUtils.initSegmentationLUT(_this.r2, stack, _this.r2.stackHelper);
          DicomViewerUtils.initSegmentationLUT(_this.r3, stack, _this.r3.stackHelper);
        }

        const planesSetup = {
          'r1': ['r2', 'r3'], // red slice
          'r2': ['r1', 'r3'], // yellow slice
          'r3': ['r1', 'r2'] // green slice
        }

        // Initialize 2D planes localizer (cross on 2D planes)
        for (const [planeName, linkedPlaneNames] of Object.entries(planesSetup)) {
          const plane = _this[planeName]

          // Add each 2D plane to the 3D scene
          _this.r0.scene.add(plane.scene);

          /*
           * Init the localizer
           * create new mesh with Localizer shaders
           */
          const planeEquation = plane.stackHelper.slice.cartesianEquation();

          /*
           * create new mesh with Localizer shaders
           * compute the dependent stack helper
           */
          const linkedPlanes = linkedPlaneNames.map(name => {
            const linkedStackHelper = _this[name].stackHelper;
            return ({
              plane: linkedStackHelper.slice.cartesianEquation(),
              color: new THREE.Color(linkedStackHelper.borderColor)
            })
          });

          DicomViewerUtils.initHelpersLocalizer(plane, stack, planeEquation, linkedPlanes);
        }

        _this.configureEvents();
        _this.updateLayout(_this.props.mode);
        _this.ready = true;
        _this.setState({ ready: true });
        _this.props.onLoaded();
      })
      .catch(error => {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }

  updateLayout (mode) {
    if (mode === 'single_view') {
      this.setSingleLayout(this.props.orientation);
    } else {
      this.setQuadLayout();
    }
  }

  centerOn (plane, point) {
    if (!plane.stackHelper) {
      return
    }
    const stackHelper = plane.stackHelper
    const ijk = StackModel.worldToData(
      stackHelper.stack,
      point
    );
    this.r1.stackHelper.index = ijk.getComponent(
      (this.r1.stackHelper.orientation + 2) % 3
    );
    this.r2.stackHelper.index = ijk.getComponent(
      (this.r2.stackHelper.orientation + 2) % 3
    );
    this.r3.stackHelper.index = ijk.getComponent(
      (this.r3.stackHelper.orientation + 2) % 3
    );

    DicomViewerUtils.updateLocalizer(this.r2, [
      this.r1.localizerHelper,
      this.r3.localizerHelper,
    ]);
    DicomViewerUtils.updateLocalizer(this.r1, [
      this.r2.localizerHelper,
      this.r3.localizerHelper,
    ]);
    DicomViewerUtils.updateLocalizer(this.r3, [
      this.r1.localizerHelper,
      this.r2.localizerHelper,
    ]);
  }

  clickedOnPoint (event, callback) {
    const canvas = event.srcElement.parentElement;
    const id = event.target.id;
    const mouse = {
      x: ((event.clientX - offset(canvas).left) / canvas.clientWidth) * 2 - 1,
      y:
          -((event.clientY - offset(canvas).top) / canvas.clientHeight) * 2 + 1,
    };

    const plane = this[`r${id}`]
    if (!plane) {
      return
    }
    const camera = plane.camera;
    // const stackHelper = plane.stackHelper;
    const scene = plane.scene;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      callback(plane, intersects[0].point, event)
    }
  }

  configureEvents () {
    const _this = this;

    function goToPoint (event) {
      _this.clickedOnPoint(event, _this.centerOn)
    }

    function pointClickedOn (event) {
      _this.clickedOnPoint(event, _this.props.pointClickedOn)
    }

    function goToSingleView (event) {
      const id = event.target.id;
      let orientation = null;
      switch (id) {
      case '0':
        orientation = '3d';
        break;
      case '1':
        orientation = 'sagittal';
        break;
      case '2':
        orientation = 'axial';
        break;
      case '3':
        orientation = 'coronal';
        break;
      }

      if (orientation != null) {
        _this.setState({ mode: 'single_view', orientation: orientation });
      }
    }

    /*
     * function toggleMode (event) {
     *   if (_this.props.mode === 'single_view') {
     *     _this.changeMode();
     *   } else {
     *     goToSingleView(event);
     *   }
     * }
     */

    function onScroll (event) {
      const view = event.target.domElement.dataset.view;
      let stackHelper = null;
      switch (view) {
      case 'r1':
        stackHelper = _this.r1.stackHelper;
        break;
      case 'r2':
        stackHelper = _this.r2.stackHelper;
        break;
      case 'r3':
        stackHelper = _this.r3.stackHelper;
        break;
      }

      if (event.delta > 0) {
        if (stackHelper.index >= stackHelper.orientationMaxIndex - 1) {
          return false;
        }
        stackHelper.index += 1;
      } else {
        if (stackHelper.index <= 0) {
          return false;
        }
        stackHelper.index -= 1;
      }

      DicomViewerUtils.updateLocalizer(_this.r2, [
        _this.r1.localizerHelper,
        _this.r3.localizerHelper,
      ]);
      DicomViewerUtils.updateLocalizer(_this.r1, [
        _this.r2.localizerHelper,
        _this.r3.localizerHelper,
      ]);
      DicomViewerUtils.updateLocalizer(_this.r3, [
        _this.r1.localizerHelper,
        _this.r2.localizerHelper,
      ]);
      return true;
    }

    function performEventAction (action, event) {
      // Check if it is a already defined action or a external one
      if (action === 'goToPoint' || action === 'goToSingleView' || action === 'toggleMode' || action === 'pointClickedOn') {
        eval(action + '(event)');
      } else {
        action(event, this);
      }
    }

    function eventHandling (event) {
      if (_this.drag) {
        return
      }
      if (event.type === 'mouseup' && event.which === 3 && _this.props.onRightClick) {
        performEventAction(_this.props.onRightClick, event);
      }
      const isClick = event.type === 'click';
      if (isClick && (event.ctrlKey || event.metaKey) && _this.props.onCtrlClick) {
        performEventAction(_this.props.onCtrlClick, event);
      } else if (isClick && event.shiftKey && _this.props.onShiftClick) {
        performEventAction(_this.props.onShiftClick, event);
      } else if (isClick && _this.props.onClick) {
        performEventAction(_this.props.onClick, event);
      } else if (event.type === 'dblclick' && _this.props.onDoubleClick) {
        performEventAction(_this.props.onDoubleClick, event);
      }
    }

    // event listeners ondoubleclick
    _this.r0.domElement.addEventListener('dblclick', eventHandling);
    _this.r1.domElement.addEventListener('dblclick', eventHandling);
    _this.r2.domElement.addEventListener('dblclick', eventHandling);
    _this.r3.domElement.addEventListener('dblclick', eventHandling);

    // event listeners onclick
    this.r0.domElement.addEventListener('click', eventHandling);
    this.r1.domElement.addEventListener('click', eventHandling);
    this.r2.domElement.addEventListener('click', eventHandling);
    this.r3.domElement.addEventListener('click', eventHandling);

    this.r0.domElement.addEventListener('mouseup', eventHandling);
    this.r1.domElement.addEventListener('mouseup', eventHandling);
    this.r2.domElement.addEventListener('mouseup', eventHandling);
    this.r3.domElement.addEventListener('mouseup', eventHandling);

    // event listeners on scrol
    this.r1.controls.addEventListener('OnScroll', onScroll);
    this.r2.controls.addEventListener('OnScroll', onScroll);
    this.r3.controls.addEventListener('OnScroll', onScroll);

    // event listener on mouse down/up/move to detect drag on all views
    for (const subref of ['r0', 'r1', 'r2', 'r3']) {
      this[subref].domElement.addEventListener('mousedown', () => {
        this.drag = false; return false
      });
      this[subref].domElement.addEventListener('mousemove', () => {
        this.drag = true
      });
      this[subref].domElement.addEventListener('mouseout', () => {
        this.drag = false
      });
    }
  }

  setQuadLayout () {
    // update 3D
    DicomViewerUtils.windowResize3D(this.r0);

    // update 2d
    DicomViewerUtils.windowResize2D(this.r1);
    DicomViewerUtils.windowResize2D(this.r2);
    DicomViewerUtils.windowResize2D(this.r3);
  }

  setSingleLayout (orientation) {
    switch (orientation) {
    case '3d':
      DicomViewerUtils.windowResize3D(this.r0);
      break;
    case 'sagittal':
      DicomViewerUtils.windowResize2D(this.r1);
      break;
    case 'axial':
      DicomViewerUtils.windowResize2D(this.r2);
      break;
    case 'coronal':
      DicomViewerUtils.windowResize2D(this.r3);
      break;
    }
  }

  componentWillUnmount () {
    DicomViewerUtils.dispose(this.r0);
    DicomViewerUtils.dispose(this.r1);
    DicomViewerUtils.dispose(this.r2);
    DicomViewerUtils.dispose(this.r3);
  }

  componentDidMount () {
    this.loadModel(this.props.data);
  }

  componentDidUpdate (prevProps, prevState) {

    if (this.props.mode !== prevProps.mode
      || this.props.orientation !== prevProps.orientation
      || (this.props.update > 1 && this.props.update !== prevProps.update)
      || prevState.ready !== this.state.ready) {
      try {
        this.updateLayout(this.props.mode);
      } catch (e) {
        // not ready yet
      }

    }

  }

  shouldComponentUpdate (nextProps, nextState) {
    this.animationOn = true;
    return nextProps.data !== this.props.data
           || nextProps.update !== this.props.update
           || nextProps.fullScreen !== this.props.fullScreen
           || nextProps.mode !== this.props.mode
           || nextProps.orientation !== this.props.orientation
           || nextState.ready !== this.state.ready
  }

  stopAnimation () {
    this.animationOn = false
  }
  startAnimation () {
    this.animationOn = true
  }

  download () {
    createZipFromRemoteFiles(this.props.data, !Array.isArray(this.props.data) ? this.props.data : "data.zip");
  }

  getCustomButtons () {
    const customButtons = [];
    const toolbarButtons = this.props.toolbarButtons;

    const addButtons = buttons => {
      if (! buttons) {
        return ;
      }
      customButtons.push(...buttons.map(b => ({ ...b, id: b.tooltip })))
    }
    if (this.props.mode == 'single_view') {
      addButtons(toolbarButtons?.single_view)
    } else {
      addButtons(toolbarButtons?.quad_view)
    }

    if (this.props.showDownloadButton) {
      customButtons.push({
        icon: faDownload,
        id: 'Download',
        tooltip: 'Download',
        action: this.download,
      });
    }

    if (this.props.fullScreen) {
      addButtons(toolbarButtons?.fullScreen)
    } else {
      addButtons(toolbarButtons?.minimized)
    }

    return customButtons;
  }

  render () {
    const { toolbarOptions, loaderOptions, mode, orientation, id, fullScreen } = this.props;
    const customButtons = this.getCustomButtons();

    const containerStyle = fullScreen
      ? {
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '9999',
        background: '#121212',
        height: '100%',
        width: '100%',
      }
      : {
        height: '100%',
        width: '100%',
      };

    const displayView = o => mode === 'single_view' && orientation === o
    const display3DView = displayView('3d')
    const doNotDisplay = o => mode === 'single_view' && orientation !== o

    const showLoader = loaderOptions && loaderOptions.showLoader

    const loader = loaderOptions && loaderOptions.instance ? (
      <loaderOptions.instance
        {...loaderOptions.props}
      />
    ) : <Loader fullscreen={fullScreen}
      handleClose={toolbarOptions?.handleClose}
      messages={toolbarOptions?.messages}
      messagesInterval={toolbarOptions?.messagesInterval}
      elapsed={toolbarOptions?.elapsed}
      backgroundStyle={toolbarOptions?.backgroundStyle}
    />

    const toolbar = toolbarOptions && toolbarOptions.instance ? (
      <toolbarOptions.instance
        buttons={customButtons}
        {...toolbarOptions.props}
      />
    ) : <CustomToolbar buttons={customButtons} containerStyles={toolbarOptions?.containerStyles}
      toolBarClassName={toolbarOptions?.toolBarClassName}
      innerDivStyles={toolbarOptions?.innerDivStyles}
      buttonStyles={toolbarOptions?.buttonStyles}/>;

    return (
      <div
        ref={this.containerRef}
        key={`${id}_component`}
        id={`${id}_component`}
        style={containerStyle}
        onMouseLeave={this.stopAnimation}
        className='container-dicom-viewer'
      >
        {!this.state.ready && showLoader && loader}
        {toolbar}
        <div
          className={classes.dicomViewer}
          style={{
            height: '90%', width: '100%', display: 'flex',
            flexWrap: 'wrap',
            backgroundColor: '#353535'
          }}
        >
          <div
            id="r0"
            className={classes.renderer + ' r0'}
            data-view="r0"
            style={{
              display: doNotDisplay('3d') ? 'none' : '',
              width: display3DView ? '100%' : '50%',
              height: display3DView ? '100%' : '50%',
              backgroundColor: '#000',
              float: 'left',
            }}
            onMouseEnter={this.startAnimation}
          />
          <div
            id="r1"
            className={classes.renderer + ' r1'}
            data-view="r1"
            style={{
              display: doNotDisplay('sagittal') ? 'none' : '',
              width: displayView('sagittal') ? '100%' : '50%',
              height: displayView('sagittal') ? '100%' : '50%',
              backgroundColor: '#000',
              float: 'left',
            }}
            onMouseEnter={this.startAnimation}
          />
          <div
            id="r2"
            className={classes.renderer + ' r2'}
            data-view="r2"
            style={{
              display: doNotDisplay('axial') ? 'none' : '',
              width: displayView('axial') ? '100%' : '50%',
              height: displayView('axial') ? '100%' : '50%',
              backgroundColor: '#000',
              float: 'left',
            }}
            onMouseEnter={this.startAnimation}
          />
          <div
            id="r3"
            className={classes.renderer + ' r3'}
            data-view="r3"
            style={{
              display: doNotDisplay('coronal') ? 'none' : '',
              width: displayView('coronal') ? '100%' : '50%',
              height: displayView('coronal') ? '100%' : '50%',
              backgroundColor: '#000',
              float: 'left',
            }}
            onMouseEnter={this.startAnimation}
          />
          <div className="segmentationLUT-r1" style={{ visibility: "hidden" }} />
          <div className="segmentationLUT-r2" style={{ visibility: "hidden" }} />
          <div className="segmentationLUT-r3" style={{ visibility: "hidden" }} />
        </div>
      </div>
    );
  }
}

const Wrapper = props => <DicomViewer {...props} />;

Wrapper.defaultProps = {
  onLoaded: () => {},
  mode: 'coronal',
  orientation: '3d',
  onClick: 'goToPoint',
  onCtrlClick: 'goToPoint',
  onShiftClick: 'goToPoint',
  onDoubleClick: 'goToPoint',
  onRightClick: undefined,
  showDownloadButton: false,
  toolbarOptions: null,
  loaderOptions: { showLoader: true }
};


Wrapper.propTypes = {
  /**
   * Component identifier
   */
  id: PropTypes.string.isRequired,
  /**
   * Path/URL to file (f.e. "/path/to/my/file.gz")
   */
  data: PropTypes.string.isRequired,
  /**
   * Initial view mode: 'single_view' or 'quad_view'
   */
  mode: PropTypes.string,
  /**
   * Display the dicom viewer in full screen
   */
  fullScreen: PropTypes.bool,
  /**
   * Initial orientation view: 'coronal', 'axial' or 'sagittal'
   */
  orientation: PropTypes.string,
  /**
   * Action to perform on click: 'goToPoint', 'goToSingleView', 'toggleMode', or other
   */
  onClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint', 'goToSingleView', 'toggleMode']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on Ctrl click: 'goToPoint', 'goToSingleView', 'toggleMode', or other
   */
  onCtrlClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint', 'goToSingleView', 'toggleMode']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on Shift click: 'goToPoint', 'goToSingleView', 'toggleMode', or other
   */
  onShiftClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint', 'goToSingleView', 'toggleMode']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on right click: 'goToPoint', 'goToSingleView', 'toggleMode', or other
   */
  onRightClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint', 'goToSingleView', 'toggleMode']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on double click: 'goToPoint', 'goToSingleView', 'toggleMode', or other
   */
  onDoubleClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint', 'goToSingleView', 'toggleMode']),
    PropTypes.func,
  ]),
  /**
   * Bool that defines the showing or not of the download button
   */
  showDownloadButton: PropTypes.bool,
  /**
   * Callback function to be called after load is complete
   */
  onLoaded: PropTypes.func,
  /**
   * Options to customize the toolbar
   */
  toolbarOptions: PropTypes.shape({
    /**
     * Reference to toolbar component
     */
    instance: PropTypes.elementType,
    /**
     * Custom toolbar props
     */
    props: PropTypes.shape({}),
    /**
     * Styles to be applied to the toolbar container
     */
    containerStyles: PropTypes.shape({}),
    /**
     * Styles to be applied to the toolbar
     */
    toolBarClassName: PropTypes.shape({}),
    /**
     * Styles to be applied to the inner div
     */
    innerDivStyles: PropTypes.shape({}),
    /**
     * Styles to be applied to the buttons
     */
    buttonStyles: PropTypes.shape({}),
  }),
  /**
   * Options to customize the loader
   */
  loaderOptions: PropTypes.shape({
    /**
     * Reference to toolbar component
     */
    instance: PropTypes.elementType,
    /**
     * Custom loader props
     */
    props: PropTypes.shape({}),
    /**
     * Bool to control the use of the loader
     */
    showLoader: PropTypes.bool,
    /**
     * Function to handle the close of the Loader
     */
    handleClose: PropTypes.func,
    /**
     * Array of Custom messages to display
     */
    messages: PropTypes.array,
    /**
     * Number of milliseconds between custom messages
     */
    messagesInterval: PropTypes.number,
    /**
     * Number of the progress value to show in linear determinate (in percentage)
     */
    elapsed: PropTypes.number,
    /**
     * Style to be applied to the Loader background
     */
    backgroundStyle: PropTypes.shape({
      /**
       * Loader's background color. Defaults to rgba(255,142,0,0.1)
       */
      backgroundColor: PropTypes.string,
    }),
  }),
  /**
   * Buttons and action to add depending in the view mode/full screen
   */
  toolbarButtons: PropTypes.shape({
    /**
     * Buttons to display if the view is minimized
     */
    minimized: PropTypes.arrayOf(PropTypes.shape({
      /**
       * The button icon
       */
      icon: PropTypes.string,
      /**
       * The tooltip of the button
       */
      tooltip: PropTypes.string,
      /**
       * A callback that will be called when the button is clicked
       */
      action: PropTypes.func,
    })),
    /**
     * Buttons to display if the view is full screen
     */
    fullScreen: PropTypes.arrayOf(PropTypes.shape({
      /**
       * The button icon
       */
      icon: PropTypes.string,
      /**
       * The tooltip of the button
       */
      tooltip: PropTypes.string,
      /**
       * A callback that will be called when the button is clicked
       */
      action: PropTypes.func,
    })),
    /**
     * Buttons to display if the view is in single view mode
     */
    single_view: PropTypes.arrayOf(PropTypes.shape({
      /**
       * The button icon
       */
      icon: PropTypes.string,
      /**
       * The tooltip of the button
       */
      tooltip: PropTypes.string,
      /**
       * A callback that will be called when the button is clicked
       */
      action: PropTypes.func,
    })),
    /**
     * Buttons to display if the view in quad view mode
     */
    quad_view: PropTypes.arrayOf(PropTypes.shape({
      /**
       * The button icon
       */
      icon: PropTypes.string,
      /**
       * The tooltip of the button
       */
      tooltip: PropTypes.string,
      /**
       * A callback that will be called when the button is clicked
       */
      action: PropTypes.func,
    }))
  })
};

export default Wrapper
