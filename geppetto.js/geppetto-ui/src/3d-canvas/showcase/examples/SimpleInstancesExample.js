import React, { Component } from 'react';
import Canvas from "@geppettoengine/geppetto-ui/3d-canvas/Canvas";
import CameraControls from "@geppettoengine/geppetto-ui/camera-controls/CameraControls";
import SimpleInstance from "@geppettoengine/geppetto-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import cube from './cube.obj';
import * as THREE from 'three';


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
      },
    };
    this.canvasIndex = 3
    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.onMount = this.onMount.bind(this);
    this.layoutRef = React.createRef();
  }
  
  onMount (scene){
    const object = scene.children[3];
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());


    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);


    scene.children[0].near = size / 100;
    scene.children[0].far = size * 100;
    scene.children[0].updateProjectionMatrix();

    scene.children[0].position.copy(center);
    scene.children[0].position.x += size / 2.0;
    scene.children[0].position.y += size / 5.0;
    scene.children[0].position.z += size / 2.0;
    scene.children[0].lookAt(center);
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
        onMount={this.onMount}
      />
    </div>
  }
}

export default withStyles(styles)(SimpleInstancesExample);
