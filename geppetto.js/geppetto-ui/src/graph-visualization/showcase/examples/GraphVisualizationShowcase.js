import React, { Component } from 'react';
import Graph from "./../../Graph";
import ReactResizeDetector, { useResizeDetector } from 'react-resize-detector';

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
      <div style={{ width: 600, height: 500 }}>
        <ReactResizeDetector handleWidth handleHeight>
          {
            ({ width, height }) => <Graph
              data={this.getData()}
              nodeLabel={node => node.name}
              linkLabel={link => link.name}
              width={width}
              height={height}
            />
          }
        </ReactResizeDetector>
      </div>
    )
  }
}
