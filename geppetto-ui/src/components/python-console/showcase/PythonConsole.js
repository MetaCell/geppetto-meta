import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import pythonConsoleGif from './console.gif';

class PythonConsole extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    return <img src={`/${pythonConsoleGif}`} />;
  }
}

PythonConsole.propTypes = {
  /**
   * Path to jupyter notebook
   */
  pythonNotebookPath: PropTypes.string.isRequired,
  /**
   * Height of the iframe in pixels
   */
  iframeHeight: PropTypes.number,
};

export default PythonConsole;
