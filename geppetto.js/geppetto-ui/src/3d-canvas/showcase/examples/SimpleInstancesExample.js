import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import neuron from './SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf';
import Button from "@material-ui/core/Button";
import { applySelection, mapToCanvasData } from "./SelectionUtils";

const instanceTemplate = {
  "eClass": "SimpleInstance",
  "id": "ANeuron",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": GEPPETTO.Resources.GLTF,
    'gltf': 'https://raw.githubusercontent.com/MetaCell/geppetto-meta/feature/120/geppetto.js/geppetto-ui/src/3d-canvas/showcase/examples/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf'
  }
}

function loadInstances (){
  GEPPETTO.ModelFactory.cleanModel();
  const instance = new SimpleInstance(instanceTemplate)
  window.Instances = [instance]
  GEPPETTO.Manager.augmentInstancesArray(window.Instances);
}

function getProxyInstances () {
  return window.Instances.map(i => (
    { 
      instancePath: i.getId(), 
      color: 
            { 
              r: Math.random(), 
              g: Math.random(), 
              b: Math.random(), 
              a: 1 
            }
    }))
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
    loadInstances()
    this.state = {
      data: getProxyInstances(),
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
      showModel: false
    };
    this.canvasIndex = 3
    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.onSelection = this.onSelection.bind(this)
    this.onMount = this.onMount.bind(this);
    this.layoutRef = React.createRef();
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  cameraHandler (obj) {
    this.lastCameraUpdate = obj;
  }

  hoverHandler (obj) {
    // deactivated due to performance issues
  }

  handleToggle () {
    loadInstances()
    this.setState({
      showModel: true, data: getProxyInstances(), cameraOptions: {
        ...this.state.cameraOptions,
        reset: true,
      } 
    })
  }

  handleClickOutside (event) {
    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth){
        this.setState({ showModel: false })
      }
    }
  }

  onMount (scene){
    console.log(scene)
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  render () {
    const { data, cameraOptions, showModel } = this.state
    const canvasData = mapToCanvasData(data)
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
        data={canvasData}
        cameraOptions={camOptions}
        cameraHandler={this.cameraHandler}
        backgroundColor={0x505050}
        onSelection={this.onSelection}
        // hoverListeners={[this.hoverHandler]}
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
