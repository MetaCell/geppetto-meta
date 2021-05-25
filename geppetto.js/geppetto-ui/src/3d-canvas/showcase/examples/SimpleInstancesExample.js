import React, { Component } from 'react';
import Canvas from "@geppettoengine/geppetto-ui/3d-canvas/Canvas";
import CameraControls from "@geppettoengine/geppetto-ui/camera-controls/CameraControls";
import SimpleInstance from "@geppettoengine/geppetto-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import cube from './cube.obj';

const instanceTemplate = {
  "eClass": "SimpleInstance",
  "id": "MG_C_3260_BROD_AREA",
  "name": "Brodmann Area 1: primary somatosensory cortex - left",
  "position": {
    "eClass": "Point",
    "x": -45.4,
    "y": -24.6,
    "z": 51.9
  },
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": GEPPETTO.Resources.OBJ,
    'obj': cube
  }
}

function getInstances () {
  GEPPETTO.ModelFactory.cleanModel();
  const instance = new SimpleInstance(instanceTemplate)
  window.Instances = [instance]
  GEPPETTO.Manager.augmentInstancesArray(window.Instances);
  return window.Instances.map(i => ({ instancePath: i.getId() }))
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
        angle: 60,
        near: 10,
        far: 2000000,
        baseZoom: 1,
        cameraControls: {
          instance: CameraControls,
          props: { wireframeButtonEnabled: false, },
        },
        reset: false,
        autorotate: false,
        wireframe: false,
        position: { x: 0, y: 0, z: 0 },
        rotation: { rx: 0, ry: 0, rz: 0, radius: 0 },
      },
    };
    this.canvasIndex = 3
    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.layoutRef = React.createRef();
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


  render () {
    const { data, cameraOptions } = this.state
    const { classes } = this.props
    let camOptions = cameraOptions;
    if (this.lastCameraUpdate) {
      camOptions = {
        ...cameraOptions,
        position: this.lastCameraUpdate.position,
        rotation: this.lastCameraUpdate.rotation,
      };
    }
    return <div ref={node => this.node = node} className={classes.container}>
      <Canvas
        ref={this.canvasRef}
        data={data}
        cameraOptions={camOptions}
        cameraHandler={this.cameraHandler}
        selectionHandler={this.selectionHandler}
        backgroundColor={0x505050}
        hoverListeners={[this.hoverHandler]}
      />
    </div>
  }
}

export default withStyles(styles)(SimpleInstancesExample);
