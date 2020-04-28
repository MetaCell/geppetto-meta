# Graph Visualization Component

React component used to visualized data in a Graph.

```
[Graph Component](./Graph.js)
```

## Examples

### Graph Visualization Component Example

Basic React Component class using the Graph Visualization Component.

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