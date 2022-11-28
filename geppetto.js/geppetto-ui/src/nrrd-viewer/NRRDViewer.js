import React, { useEffect, useRef } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import NRRDThreeDEngine from './nrrdEngine/nrrdThreeEngine';
import { examples } from './mock.js';

const useStyles = makeStyles(() => ({
  container: {
    position: 'relative',
    width: '100%',
    minWidth: 1144,
    height: 500,
  },
  guiContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 999,
  },
}));

const NRRDViewer = ({
  files,
  onResize,
  cameraOptions,
  backgroundColor,
  skipOnMount = true,
}) => {
  const sceneRef = useRef(null);
  const guiRef = useRef(null);

  const styles = useStyles();

  useEffect(() => {
    // Initialize nrrd engine
    const threeDEngine = new NRRDThreeDEngine(
      files,
      sceneRef.current,
      guiRef.current,
      cameraOptions,
      backgroundColor
    );

    const renderer = threeDEngine.getRenderer();
    const gui = threeDEngine.getGUI();

    return () => {
      // clean up dom rendering
      sceneRef.current.removeChild(renderer.domElement);
      guiRef.current.removeChild(gui.domElement);
    };
  }, []);

  return (
    <ReactResizeDetector skipOnMount={skipOnMount} onResize={onResize}>
      <div className={styles.container} ref={sceneRef}>
        <div ref={guiRef} className={styles.guiContainer} />
      </div>
    </ReactResizeDetector>
  );
};

NRRDViewer.defaultValues = {
  files: examples,
  skipOnMount: true,
  onResize: () => {},
  cameraOptions: {},
};

NRRDViewer.propTypes = {
  /**
   * URLs pointing to the nrrd files to be rendered in this component.
   */
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,

  /**
   * Boolean value indicating if the nnrd loader should skip on mount . Defaults to false.
   */
  skipOnMount: PropTypes.bool,
  /**
   * Function to callback on model resize
   */
  onResize: PropTypes.func,
  /**
   * Object to set scene camera options
   */
  cameraOptions: PropTypes.object,
  /**
   * String to select scene background color
   */
  backgroundColor: PropTypes.string,
};

export default NRRDViewer;
