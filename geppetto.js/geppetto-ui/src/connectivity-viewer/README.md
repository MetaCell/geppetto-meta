# Connectivity Viewer

This widget visualises connections between instances present in the Geppetto model, if any. The widget takes the Geppetto model factory as a prop and checks instances in the Geppetto model - if any connections between the instances are found they are visualised in the selected layout.  The layout initially displayed is controlled via the layout prop, while the user can then switch between layouts via the UI by clicking on the gear button. Currently, four layouts are supported: [adjacency matrix](https://en.wikipedia.org/wiki/Adjacency_matrix), [force directed graph](https://en.wikipedia.org/wiki/Force-directed_graph_drawing), [hive plot](http://www.hiveplot.com/) and [chord diagram](https://en.wikipedia.org/wiki/Chord_diagram).

```element
connectivity-viewer/ConnectivityComponent
```

## Examples

### Connectivity Force

Draws circles for each node, connected by lines for each edge. Nodes repel each other (force directed) in order to reduce clutter, and can be interactively dragged. On hover the node names are revealed as tooltips. More info on force directed graph visualisation [here](https://en.wikipedia.org/wiki/Force-directed_graph_drawing).

```
connectivity-viewer/ConnectivityShowcaseForce
```

## Libraries

[d3](https://www.npmjs.com/package/d3)
