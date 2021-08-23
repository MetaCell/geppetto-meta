import React, { Component } from 'react';
import Graph from "./../../Graph";

export const GraphVisualizationShowcase = (props) => {

  const { text } = props;

  return (
    <div style={{ width: 600, height: 500 }}>
      <Graph
        data={this.getData()}
        nodeLabel={node => node.name}
        linkLabel={link => link.name}
      />
    </div>
  )
}
