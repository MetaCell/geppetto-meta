# Geppetto Graph Visualizer (GGV)

## Parameters

- **data**:

```javascript
{
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
```

## With react-flexlayout

If you are planning to use GGV with react-flexlayout, remember to add the resize event listener to the node where GGV will be attached. Example bellow:

```javascript
// react-layout factory function
factory = (node) => {
    var component = node.getComponent();
    if (component === 'graph') {
        const { width, height } = this.state

        node.setEventListener("resize", ({ rect }) => {
            const { width, height } = rect
            this.setState({ width, height }) // set new width and height when window resizes
        })

        return (
            <GeppettoGraphVisualizer // notify GGV of the changes
                width={width}
                height={height}
                {...}
            />
        )
    }
}
```

## Without react-flexlayout

Wrap GGV in a div and remember to set a height somewhere:

```javascript
render() {
    return (
        <div style={{ height: '500px' }}> // Rememeber to define a height on the parent element for GGV.
            <h3>Some elements above the canvas</h3>

            <GeppettoGraphVisualizer // if omitted, GGV takes 100%
                style={{ width: '80%', height: '90%' }}
                {...}
            >

            <h3>Some elements below the canvas</h3>
        </div>
    )
}
```

## Adding obj to scene

- **url**: String (Optional)
    Specify a obj file URL to add to the scene.
- **wireframe**: Bool (Optional. Default: true)
    Create a wireframe for the object.
- **wireframeColor**: Hex (Optional. Default: *0x6893DE*)
    Specify the wireframe color (in hexadecimal).

## Selectively hold nodes in place

To lock some of the nodes in place, add *defaultX*, *defaultY* and *defaultZ* property to them.

```javascript
const nodes = [
    { id: 0 }, // free to move
    { id: 1, defaultX:0, defaultY:0, defaultZ:0 }, // locked
    { id: 2 }, // free to move
]
```

---

## [More...](https://github.com/vasturiano/react-force-graph/blob/master/README.md)
