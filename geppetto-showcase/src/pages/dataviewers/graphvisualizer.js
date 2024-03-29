import React, { Component } from 'react';
import Showcase from "../../components/showcase/Showcase";
import GraphVisualizationMarkdown from "@metacell/geppetto-meta-ui/graph-visualization/README.md";


export default class GraphVisualizer extends Component {
  render () {
    const { currentPageHandler } = this.props;

    return (
      <Showcase
        markdown={GraphVisualizationMarkdown}
        currentPageHandler={currentPageHandler}
      />
    );
  }
}
