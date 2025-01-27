import React, { Component } from 'react';

import OpenSeaDragon from 'openseadragon';
import { PropTypes } from 'prop-types';
import * as util from '../utilities';
import {
  faHome,
  faSearchPlus,
  faSearchMinus,
} from '@fortawesome/free-solid-svg-icons';
import CustomToolbar from '../common/CustomToolbar';

const styles = {
  bigImageViewerContainer: {
    display: 'flex',
    padding: "2rem",
    alignItems: 'stretch',
    flex: 1,
  },
  bigImageViewerContent: {
    display: 'flex',
    alignItems: 'stretch',
    paddingLeft: "0.5rem",
    flex: 1,
  }
};

const ZOOM_OUT_TOOLTIP = 'Zoom Out';
const ZOOM_IN_TOOLTIP = 'Zoom In';
const CENTER_IMAGE_TOOLTIP = 'Center Image';

class BigImageViewer extends Component {
  constructor (props) {
    super(props);

    const settings = {
      id: this.props.id + '_component',
      zoomInButton: 'zoom-in',
      zoomOutButton: 'zoom-out',
      homeButton: 'home',
      fullPageButton: 'full-page',
    };

    this.state = {
      settings: util.extend(settings, this.props.settings),
      file: this.extractFilePath(this.props.data),
    };

    // this.download = this.download.bind(this);
    this.goHome = this.goHome.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.fullPage = this.fullPage.bind(this);
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    this.loadViewer();
  }

  componentDidMount () {
    this.loadViewer();
  }

  extractFilePath (data) {
    let file;
    if (data !== undefined) {
      if (data.getMetaType === undefined) {
        file = data;
      } else if (
        data.getMetaType() === 'Instance'
        && data.getVariable().getInitialValues()[0].value.format === 'DZI'
      ) {
        file = data.getVariable().getInitialValues()[0].value.data;
      }
    }
    return file;
  }

  loadViewer () {
    if (this.state.file !== undefined) {
      if (this.viewer !== undefined) {
        this.viewer.destroy();
      }
      this.state.settings.tileSources = this.state.file;
      this.viewer = OpenSeaDragon(this.state.settings);
    }
  }

  // These four methods are not exposed by OpenSeaDragon
  goHome () {
    this.viewer.viewport.goHome();
  }

  zoomIn () {
    this.viewer.viewport.zoomBy(this.viewer.zoomPerClick / 1.0);
    this.viewer.viewport.applyConstraints();
  }

  zoomOut () {
    this.viewer.viewport.zoomBy(1.0 / this.viewer.zoomPerClick);
    this.viewer.viewport.applyConstraints();
  }

  fullPage () {
    this.viewer.setFullScreen(true);
    this.viewer.fullPageButton.element.focus();
    this.viewer.viewport.applyConstraints();
  }

  getCustomButtons () {
    const customButtons = [];
    customButtons.push({
      icon: faSearchMinus,
      id: 'zoom-out',
      tooltip: ZOOM_OUT_TOOLTIP,
      action: this.zoomOut,
    });
    customButtons.push({
      icon: faSearchPlus,
      id: 'zoom-in',
      tooltip: ZOOM_IN_TOOLTIP,
      action: this.zoomIn,
    });
    customButtons.push({
      icon: faHome,
      id: 'home',
      tooltip: CENTER_IMAGE_TOOLTIP,
      action: this.goHome,
    });
    return customButtons;
  }

  render () {
    const { toolbarOptions } = this.props;
    const customButtons = this.getCustomButtons();
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
      <div className="big-image-viewer-wrapper" style={{ ...styles.bigImageViewerContainer, ...(this.props?.styles?.bigImageViewerContainer ?? {}) }}>
        {toolbar}
        <div
          id={this.props.id + '_component'}
          className="big-image-viewer" style={styles.bigImageViewerContent}
        />
      </div>
    );
  }
}

BigImageViewer.defaultProps = { settings: [], toolbarOptions: null }

BigImageViewer.propTypes = {
  /**
   * Component identifier
   */
  id: PropTypes.string.isRequired,
  /**
   * Path/URL to image file (f.e. "/path/to/my/image.dzi")
   */
  data: PropTypes.string.isRequired,
  /**
   * All required and optional settings for instantiating a new instance of an OpenSeadragon image viewer
   */
  settings: PropTypes.array,
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
};

export default BigImageViewer;
