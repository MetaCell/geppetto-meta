# Graph Visualization Component

React component used to visualized a graph data structure in 2D or 3D space using a force-directed iterative layout.

Uses canvas/WebGL for rendering and d3-force-3d for the underlying physics engine.

[Graph Component](./Graph.js)

### Component Properties:

#### Adding Data and Specifying dimensional space
- **data**: Object (Required). Object with arrays of nodes and links used to render the graph.
- **d2**: Bool (Optional. Default: false)
    If true, the graph would be 2D.

#### Adding obj to scene
- **url**: String (Optional)
    Specify a obj file URL to add to the scene.
- **wireframe**: Bool (Optional. Default: true)
    Create a wireframe for the object.
- **wireframeColor**: Hex (Optional. Default: *0x6893DE*)
    Specify the wireframe color (in hexadecimal).
- **xGap**: Int (Optional. Default: 20)
    Define width gap size with respect to the parent container.
- **yGap**: Int (Optional. Default: 45)
    Define height gap size with respect to the parent container.

#### properties for 2d graph
- **font**: String (Optional. Default: "6px Source Sans Pro")
    Set the default font size and style inside the nodes.
- **nodeRelSize**: Int (Optional. Default: 20).
    Adjust the size of the nodes.

#### Forces
- **forceLinkDistance**: Int (Optional. Default: 90).
    Adjust the length of the spring simulated between two nodes.
- **forceLinkStrength**: Int (Optional. Default: 0.7).
    Adjust the stiffness coiefficient for the spring simulated between two nodes
- **forceChargeStrength**: Int (Optional. Default: -200).
    Adjust the repulsion coefficient simulated between two nodes.
- **timeToCenter2DCamera**: Int (Optional. Default: 0).
    Transition time in ms when centering camera in 2D Graph after window resize event.
- **forceRadial**: Int (Optional. Default: 1).
    Creates a radial atractive force of radial circle equal to forceRadial. Useful to avoid nodes scattering away when they have no links.
    

## Example

Example of basic React Component class using the Graph Visualization Component.

[GraphVisualizationShowCase](./showcase/examples/GraphVisualizationShowcase.js)


```javascript
    
import React, { Component } from 'react';
import GeppettoGraphVisualization from "./../../Graph";

export default class GraphVisualizationShowcase extends Component {
    getData () {
        return {
           nodes: [
               {id: 1},
               {id: 2},
               {id: 3}
           ],
           links: [
               {source: 1, target: 2},
               {source: 2, target: 3},
               {source: 3, target: 1}
           ]
        }
    }
   render () {
       return (
           <GeppettoGraphVisualization
                data={this.getData()}
                nodeLabel={node => node.name}
                linkLabel={link => link.name}
            />
        )
    }
}
```

## Libraries

[react](https://www.npmjs.com/package/react)
[react-dom](https://www.npmjs.com/package/react-dom)
[d3-force-3d](https://www.npmjs.com/package/d3-force-3d)
[three.js](https://www.npmjs.com/package/three)
[react-force-graph-2d](https://www.npmjs.com/package/react-force-graph-2d)
[react-force-graph-3d](https://www.npmjs.com/package/react-force-graph-3d)