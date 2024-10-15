import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import BaseDicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import {
  faThLarge,
  faSquare,
  faExchangeAlt,
  faExpandAlt,
  faCompressAlt,
} from '@fortawesome/free-solid-svg-icons';


const DicomViewer = props => {
  const [fullScreen, setFullScreen] = useState(props.fullScreen);
  const [mode, setMode] = useState(props.mode);
  const [orientation, setOrientation] = useState(props.orientation);

  const changeMode = () => {
    if (mode === 'single_view') {
      setMode('quad_view');
    } else {
      setMode('single_view');
    }
  }

  const changeOrientation = () => {
    let newOrientation;
    switch (orientation) {
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
    setOrientation(newOrientation);
  }

  const restore = () => {
    setFullScreen(false);
  }

  const goFullScreen = () => {
    setFullScreen(true);
  }

  const goToSingleView = event => {
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
      setMode('single_view');
      setOrientation(orientation);
    }
  }

  const toggleMode = event => {
    if (mode === 'single_view') {
      changeMode();
    } else {
      goToSingleView(event);
    }
  }

  return <BaseDicomViewer
    { ...props}
    orientation={orientation}
    mode={mode}
    fullScreen={fullScreen}
    onCtrlClick={props.onCtrlClick || toggleMode}
    toolbarOptions={{ innerDivStyles: { backgroundColor: 'rgb(0,0,0,0);' } }}
    toolbarButtons={{
      single_view: [
        { icon: faThLarge, tooltip: 'Multi View', action: changeMode },
        { icon: faExchangeAlt, tooltip: 'Change Orientation', action: changeOrientation }
      ],
      quad_view: [
        { icon: faSquare, tooltip: 'Single View', action: changeMode }
      ],
      fullScreen: [
        { icon: faCompressAlt, tooltip: 'Restore', action: restore }
      ],
      minimized: [
        { icon: faExpandAlt, tooltip: 'Maximize', action: goFullScreen }
      ]
    }}
    loaderOptions={{ showLoader: true, message: 'Loading for un' }}
  />
};

DicomViewer.defaultProps = {
  onLoaded: () => {},
  mode: 'quad_view',
  orientation: '3d',
  onClick: 'goToPoint',
  onCtrlClick: undefined,
  onShiftClick: undefined,
  onDoubleClick: undefined,
  onRightClick: undefined,
  showDownloadButton: false,
  toolbarOptions: null,
  loaderOptions: { showLoader: true }
};
DicomViewer.propTypes = BaseDicomViewer.propTypes;
DicomViewer.propTypes = {
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
  mode: PropTypes.oneOf(['single_view', 'quad_view']),
  /**
   * Display the dicom viewer in full screen
   */
  fullScreen: PropTypes.bool,
  /**
   * Initial orientation view: 'coronal', 'axial' or 'sagittal'
   */
  orientation: PropTypes.oneOf(['coronal', 'axial', 'sagittal']),
  /**
   * Action to perform on click: 'goToPoint' or custom action, default is 'goToPoint'
   */
  onClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on Ctrl click: 'goToPoint' or custom action, default is a "go to single view" action
   */
  onCtrlClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on Shift click: 'goToPoint' or custom action, default is undefined
   */
  onShiftClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on right click: 'goToPoint' or custom action, default is undefined
   */
  onRightClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint']),
    PropTypes.func,
  ]),
  /**
   * Action to performe on double click: 'goToPoint' or custom action, default is undefined
   */
  onDoubleClick: PropTypes.oneOfType([
    PropTypes.oneOf(['goToPoint']),
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

export default DicomViewer