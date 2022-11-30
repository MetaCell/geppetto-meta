import React, { useEffect, useMemo, useRef } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import NRRDThreeDEngine from './nrrdEngine/nrrdThreeEngine';
import { examples } from './mock.js';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
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
  formContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 999,
    '& .formControl': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      margin: theme.spacing(1),

      '& .MuiSelect-root': {
        flex: 1,
        backgroundColor: '#3c3c3c;',
        borderRadius: '0.25rem',
        paddingLeft: '0.25rem',
        minWidth: 120,
      },
    },
  },
}));

let threeDEngine;

const NRRDViewer = ({
  files,
  onResize,
  cameraOptions,
  backgroundColor,
  skipOnMount = true,
}) => {
  const sceneRef = useRef(null);
  const guiRef = useRef(null);

  const classes = useStyles();

  const [selectedInstance, setSelectedInstance] = React.useState('');

  const handleChange = (event) => {
    console.log(selectedInstance, event.target.value, threeDEngine, 'val');
    if (threeDEngine !== undefined) {
      threeDEngine.updateSelectedInstanceId(
        event.target.value,
        selectedInstance ?? null
      );
    }
    setSelectedInstance(event.target.value);
  };

  useEffect(() => {
    // Initialize nrrd engine
    threeDEngine = new NRRDThreeDEngine(
      files,
      sceneRef.current,
      guiRef.current,
      cameraOptions,
      backgroundColor,
      selectedInstance
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
      <div className={classes.container} ref={sceneRef}>
        <div ref={guiRef} className={classes.guiContainer} />
        <div className={classes.formContainer}>
          <div className={'formControl'}>
            <InputLabel id="demo-simple-select-label" className={classes.text}>
              Instance
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedInstance}
              onChange={handleChange}
              className={classes.select}
            >
              <MenuItem value="">None</MenuItem>
              {files.map((nrrd) => (
                <MenuItem value={nrrd.id} key={nrrd.id}>
                  {nrrd.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
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
