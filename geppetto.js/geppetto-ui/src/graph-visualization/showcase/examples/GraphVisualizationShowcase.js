import React, { Component } from 'react';
import Graph from "./../../Graph";

const styles = () => ({
  container: {
    height: '100%',
    width: '100%',
  },
});

export default class GraphVisualizationShowcase extends Component {

  getData () {
    return {
      nodes: [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 1 }
      ]
    }
  }

  render () {
    return (
      <div className={classes.container}>
        <Graph
          data={this.getData()}
          nodeLabel={node => node.name}
          linkLabel={link => link.name}
        />
      </div>
    )
  }
}
