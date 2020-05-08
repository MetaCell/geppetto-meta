# Connectivity

Visualize connections between model entities.

The way information is displayed is controlled via the layout prop. Currently, four layouts are supported: matrix, force, hive and chord.
Multiple Lines

```element
connectivity-viewer/ConnectivityComponent
```

## Examples

### Connectivity Matrix

Draws a square matrix, where each row [column] correspond to a source [target] node. Therefore, filled squares at i,j denote a directed edge from node i to node j. The rows/columns can be sorted by node name, number of incoming connections, and number of outgoing connections. Circles above each row/column indicate the type of nodes in that row/column.

```
connectivity-viewer/showcase/examples/ConnectivityShowcaseMatrix
```

### Connectivity Force

Draws circles for each node, connected by lines for each edge. Nodes repel each other (force directed) in order to reduce clutter, and can be interactively dragged. Hover over to see the node name.

```
connectivity-viewer/showcase/examples/ConnectivityShowcaseForce
```

## Libraries

[d3](https://www.npmjs.com/package/d3)
