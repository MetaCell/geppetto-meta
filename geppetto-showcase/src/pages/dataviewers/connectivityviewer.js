import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import ConnectivityMarkdown from "@geppettoengine/geppetto-ui/connectivity-viewer/README.md";


export default class ConnectivityViewer extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={ConnectivityMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
