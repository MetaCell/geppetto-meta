import React, { Component } from 'react';
import Canvas from "@geppettoengine/geppetto-ui/3d-canvas/Canvas";
import CameraControls from "@geppettoengine/geppetto-ui/camera-controls/CameraControls";
import SimpleInstance from "@geppettoengine/geppetto-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import cube from './cube.obj';
import Button from "@material-ui/core/Button";


const instanceTemplate = {
  "eClass": "SimpleInstance",
  "id": "ACube",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": GEPPETTO.Resources.OBJ,
    'obj': cube
  }
}
const instanceTemplate2 = {
  "eClass": "SimpleInstance",
  "id": "ASecondCube",
  "name": "The second SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "position": {
    "eClass": "Point",
    "x": 0,
    "y": 0,
    "z": 1
  },
  "visualValue": {
    "eClass": GEPPETTO.Resources.OBJ,
    'obj': cube
  }
}

function getInstances () {
  GEPPETTO.ModelFactory.cleanModel();
  const instance = new SimpleInstance(instanceTemplate)
  const instance2 = new SimpleInstance(instanceTemplate2)
  window.Instances = [instance, instance2]
  GEPPETTO.Manager.augmentInstancesArray(window.Instances);
  return window.Instances.map(i => ({ instancePath: i.getId(), color: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 } }))
}

const styles = () => ({
  container: {
    height: '800px',
    width: '1240px',
    display: 'flex',
    alignItems: 'stretch',
  },
});

class SimpleInstancesExample extends Component {
  constructor (props) {
    super(props);
    this.state = {
      data: getInstances(),
      cameraOptions: {
        angle: 50,
        near: 0.01,
        far: 1000,
        baseZoom: 1,
        cameraControls: {
          instance: CameraControls,
          props: { wireframeButtonEnabled: false, },
        },
        reset: false,
        autorotate: false,
        wireframe: false,
        showModel: false
      },
    };
    this.canvasIndex = 3
    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.onMount = this.onMount.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.layoutRef = React.createRef();
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
  
  onMount (scene){
  }

  cameraHandler (obj) {
    console.log("camera handler" + obj)
    this.lastCameraUpdate = obj;
  }

  selectionHandler (selectedMap) {
    console.log("selection handler" + selectedMap)
  }

  hoverHandler (obj) {
    console.log("hover handler" + obj)
  }
  handleToggle () {
    this.setState({ showModel: true })
  }


  handleClickOutside (event) {
    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth){
        this.setState({ showModel: false })
      }
    }
  }


  render () {
    const { data, cameraOptions, showModel } = this.state
    const { classes } = this.props
    let camOptions = cameraOptions;
    if (this.lastCameraUpdate) {
      camOptions = {
        ...cameraOptions,
        position: this.lastCameraUpdate.position,
        rotation: this.lastCameraUpdate.rotation,
      };
    }
    return showModel ? <div ref={node => this.node = node} className={classes.container}>
      <Canvas
        ref={this.canvasRef}
        data={data}
        cameraOptions={camOptions}
        cameraHandler={this.cameraHandler}
        selectionHandler={this.selectionHandler}
        backgroundColor={0x505050}
        hoverListeners={[this.hoverHandler]}
        onMount={this.onMount}
      />
    </div> : <Button
      variant="outlined"
      color="primary"
      onClick={this.handleToggle}
    >
      Show Example
    </Button>
  }
}

export default withStyles(styles)(SimpleInstancesExample);
