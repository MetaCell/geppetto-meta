import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import neuron from './SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf';
import contact from './Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf';
import Button from "@material-ui/core/Button";
import { applySelection, mapToCanvasData } from "./SelectionUtils";

const instance1spec = {
  "eClass": "SimpleInstance",
  "id": "ANeuron",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": GEPPETTO.Resources.GLTF,
    'gltf': neuron
  }
}
const instance2spec = {
  "eClass": "SimpleInstance",
  "id": "AContact",
  "name": "The second SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": GEPPETTO.Resources.GLTF,
    'gltf': contact
  }
}

function loadInstances (){
  GEPPETTO.ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(instance1spec)
  const instance2 = new SimpleInstance(instance2spec)
  window.Instances = [instance1, instance2]
  GEPPETTO.Manager.augmentInstancesArray(window.Instances);
}

function getProxyInstances () {
  return window.Instances.map(i => (
    { instancePath: i.getId(), }))
}

const styles = () => ({
  container: {
    height: '800px',
    width: '1240px',
    display: 'flex',
    alignItems: 'stretch',
  },
});

class MultipleInstancesExample extends Component {
  constructor (props) {
    super(props);
    loadInstances()
    this.state = {
      data: getProxyInstances(),
      numberOfInstances: 5,
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
    this.addInstance = this.addInstance.bind(this);
    this.removeInstance = this.removeInstance.bind(this);
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

  addInstance() {
    const next = this.state.numberOfInstances + 1;
    loadInstances()
    this.setState({
      showModel: true, data: getProxyInstances(), cameraOptions: {
        ...this.state.cameraOptions,
        reset: true, numberOfInstances: next
      } 
    })
  }

  removeInstance() {
    const next = this.state.numberOfInstances - 1 ;
    loadInstances()
    this.setState({
      showModel: true, data: getProxyInstances(), cameraOptions: {
        ...this.state.cameraOptions,
        reset: true, numberOfInstances: next
      } 
    })
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
      { 
        [...Array(this.state.numberOfInstances)].map((e, i) =>
          <Canvas
            key={`canvas_${i}`}
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={camOptions}
            cameraHandler={this.cameraHandler}
            backgroundColor={0x505050}
            onSelection={this.onSelection}
            // hoverListeners={[this.hoverHandler]}
            onMount={this.onMount}
        />) 
      }   
    </div> : <Button
      variant="outlined"
      color="primary"
      onClick={this.handleToggle}
    >
      Show Example
    </Button>
  }
}

export default withStyles(styles)(MultipleInstancesExample);
