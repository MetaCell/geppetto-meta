import React, { Component } from 'react';
import * as FlexLayout from '@geppettoengine/geppetto-ui/flex-layout/src';
import Canvas from "@geppettoengine/geppetto-ui/3d-canvas/Canvas";
import CameraControls from "@geppettoengine/geppetto-ui/camera-controls/CameraControls";
import { getThreeJSObjects, json } from "./util";
import { withStyles } from '@material-ui/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import neuronOBJ from './assets/SketchVolumeViewer_RIH_RIH_1_1_0000.obj';


const styles = () => ({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
});

class CanvasState {
  constructor (){
    this.ref = React.createRef()
    this.data = []
    this.threeDObjects = getThreeJSObjects()
    this.cameraOptions = {
      angle: 75,
      near: 0.1,
      far: 1000,
      baseZoom: 1,
      cameraControls: {
        instance: CameraControls,
        props: { wireframeButtonEnabled: false, },
      },
      reset: false,
      autorotate: false,
      wireframe: false,
      position: { x: 0, y: 0, z: 5 },
      rotation: { rx: 0, ry: 0, rz: 0, radius: 0 },
    }
  }
}


class CanvasPoc extends Component {
  constructor (props) {
    super(props);
    this.state = {
      firstRender: true,
      model: FlexLayout.Model.fromJson(json),
    };
    this.canvasIndex = 3
    this.cameraHandler = this.cameraHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.onMount = this.onMount.bind(this);
    this.factory = this.factory.bind(this);
    this.layoutRef = React.createRef();
    this.canvas = {}
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.canvas !== this.props.canvas) {
      this.layoutRef.current.addTabWithDragAndDropIndirect("Add new<br>(Drag to location)", {
        component: "canvas",
        name: "Canvas " + this.canvasIndex++
      })
    }
  }

  factory (node) {
    const canvasId = node._attributes.id
    if (!Object.keys(this.canvas).includes(canvasId)){
      this.canvas[canvasId] = new CanvasState()
    }
    const { cameraOptions, ref, data, threeDObjects } = this.canvas[canvasId]
    const { classes } = this.props
    const { firstRender } = this.state

    if (firstRender) {
      this.setState({ firstRender:false })
      return <div className={classes.container}/>;
    }

    return (
      <div className={classes.container}>
        <Canvas
          ref={ref}
          data={data}
          threeDObjects={threeDObjects}
          cameraOptions={cameraOptions}
          cameraHandler={obj => this.cameraHandler(obj, canvasId) }
          selectionHandler={selectedMap => this.selectionHandler(selectedMap, canvasId)}
          backgroundColor={0x505050}
          hoverListeners={[obj => this.hoverHandler(obj, canvasId)]}
          onMount={this.onMount}
        />
      </div>
    );
  }

  onMount (scene) {
    const loader = new OBJLoader();
    loader.load( neuronOBJ , function ( object ) {
      object.name = 'neuron';
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

      scene.add( object );
    })
  }

  cameraHandler (obj, canvasID) {
    /*
     * this.canvas[canvasID].cameraOptions = {
     *   ...this.canvas[canvasID].cameraOptions,
     *   position: obj.position,
     *   rotation: obj.rotation,
     * };
     * console.log(`camera handler: canvas ${canvasID}`)
     */
  }

  selectionHandler (selectedMap, canvasID) {
    // console.log(`selection handler: canvas ${canvasID}`)
  }

  hoverHandler (obj, canvasID) {
    // console.log(`hover handler: canvas ${canvasID}`)
  }


  render () {
    return (
      <div>
        <FlexLayout.Layout
          ref={this.layoutRef}
          model={this.state.model}
          factory={this.factory.bind(this)}
        />
      </div>

    );
  }
}

export default withStyles(styles)(CanvasPoc);
