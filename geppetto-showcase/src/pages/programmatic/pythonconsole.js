import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import PythonConsoleMarkdown from "@metacell/geppetto-meta-ui/python-console/README.md";


export default class PythonConsole extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={PythonConsoleMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
