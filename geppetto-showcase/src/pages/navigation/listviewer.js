import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import ListViewerMarkdown from "@geppettoengine/geppetto-ui/list-viewer/README.md";


export default class ListViewer extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={ListViewerMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
