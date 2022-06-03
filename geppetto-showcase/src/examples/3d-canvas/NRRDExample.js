import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import VFB_00000001 from './assets/vfb/VFB_00000001.nrrd';
import JRC2018UScaled2Microns from './assets/vfb/JRC2018U-Scaled2Microns.nrrd';
import JRC2018UScaled2MicronsThenHalfed from './assets/vfb/JRC2018U-Scaled2MicronsThenHalfed.nrrd';
import VFBVolumeAngio from './assets/vfb/stent.nrrd';
import VFBVolumeCT50 from './assets/vfb/CTbrain50.nrrd';
import VFBVolumeBrain50 from './assets/vfb/MRI-brain50.nrrd';
import Button from "@material-ui/core/Button";
import { mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils";
import CaptureControls from "@metacell/geppetto-meta-ui/capture-controls/CaptureControls";
import Resources from '@metacell/geppetto-meta-core/Resources';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';
import CanvasTooltip from "@metacell/geppetto-meta-ui/3d-canvas/utils/CanvasToolTip"


const volumes = [JRC2018UScaled2Microns, JRC2018UScaled2MicronsThenHalfed, VFBVolumeBrain50, VFBVolumeCT50, VFBVolumeAngio, VFB_00000001];
let indexVolume = 0;

let instance1spec = {
  "eClass": "SimpleInstance",
  "id": "NRRD",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": Resources.NRRD,
    'nrrd': volumes[indexVolume]
  }
}

function loadInstances (){
  ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(instance1spec)
  window.Instances = [instance1]
  augmentInstancesArray(window.Instances);
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
  button: {
    height: '30px',
    maxHeight : '100px',
    width: '1240px',
    display: 'flex',
    backgroundColor: 'grey',
    margin : "0 auto",
    position : "absolute"
  }
});

class NRRDExample extends Component {
  constructor (props) {
    super(props);
    this.tooltipRef = React.createRef();
    loadInstances()
    this.state = {
      data: getProxyInstances(),
      showLoader: false,
      cameraOptions: {
        angle: 50,
        near: 0.01,
        far: 1000,
        baseZoom: 1,
        cameraControls: {
          instance: CameraControls,
          props: { wireframeButtonEnabled: false },
        },
        reset: false,
        autorotate: false,
        rotateSpeed : .2,
        wireframe: false,
      },
      showModel: false
    };
    this.canvasIndex = 3
    this.hoverHandler = this.hoverHandler.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.toggleVolume = this.toggleVolume.bind(this);
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


  hoverHandler (objs, canvasX, canvasY) {
    this.tooltipRef?.current?.updateIntersected({
      o: objs[objs.length - 1],
      x: canvasX,
      y: canvasY,
    });
  }

  handleToggle () {
    this.setState({ showLoader: true })
    loadInstances()
    this.setState({ showModel: true, showLoader: false, data: getProxyInstances(), cameraOptions: { ...this.state.cameraOptions, } })
  }

  toggleVolume () {
    indexVolume < volumes.length ? indexVolume = indexVolume + 1 : indexVolume = 0;
    instance1spec.visualValue.nrrd = volumes[indexVolume];
    loadInstances();
    this.setState({ data: getProxyInstances(), cameraOptions: { ...this.state.cameraOptions, } })
  }

  handleClickOutside (event) {
    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth){
        this.setState({ showModel: false })
      }
    }
  }

  onMount (scene){
  }

  onSelection (selectedInstances){
  }

  render () {
    const { data, cameraOptions, showModel, showLoader } = this.state
    const canvasData = mapToCanvasData(data)
    const { classes } = this.props

    const captureOptions = {
      captureControls: {
        instance: CaptureControls,
        props: {}
      },
      recorderOptions: {
        mediaRecorderOptions: {
          mimeType: 'video/webm',
        },
        blobOptions:{
          type: 'video/webm'
        }
      },
      screenshotOptions:{
        resolution:{
          width: 3840,
          height: 2160,
        },
        quality: 0.95,
        pixelRatio: 1,
        filter: () => true
      },
    }

    return showLoader ? <Loader active={true} /> : showModel ? (
      <div ref={node => this.node = node} className={classes.container}>
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          onClick={this.toggleVolume}
        >
          Toggle Volume
        </Button>
        <>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={cameraOptions}
            captureOptions={captureOptions}
            backgroundColor={0xFFFFFF}
            onSelection={this.onSelection}
            onMount={this.onMount}
            id="canvas"
            className="canvas"
            hoverListeners={[this.hoverHandler]}
          />
        </>
      </div>
    ) : <Button
      variant="outlined"
      color="primary"
      onClick={this.handleToggle}
    >
      Show Example
    </Button>
  }
}

export default withStyles(styles)(NRRDExample);
