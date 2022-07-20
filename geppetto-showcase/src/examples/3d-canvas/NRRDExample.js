import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
let VFB_00101567 = "https://v2.virtualflybrain.org/data/VFB/i/0010/1567/VFB_00101567/volume.nrrd";
let VFB_0010101b = "https://v2.virtualflybrain.org/data/VFB/i/0010/101b/VFB_00101567/volume.nrrd";
let VFB_001012vj = "https://v2.virtualflybrain.org/data/VFB/i/0010/12vj/VFB_00101567/volume.nrrd";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils";
import CaptureControls from "@metacell/geppetto-meta-ui/capture-controls/CaptureControls";
import Resources from '@metacell/geppetto-meta-core/Resources';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';
import CanvasTooltip from "@metacell/geppetto-meta-ui/3d-canvas/utils/CanvasToolTip"
import axios from 'axios';
import { NRRDLoader } from "three/examples/jsm/loaders/NRRDLoader";

function getInstance (volume) {
  return {
    "eClass": "SimpleInstance",
    "id": "NRRD",
    "name": "The first SimpleInstance to be render with Geppetto Canvas",
    "type": { "eClass": "SimpleType" },
    "visualValue": {
      "eClass": Resources.NRRD,
      'nrrd': volume
    }
  }
}

function loadInstances (volume){
  ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(getInstance(volume))
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

const defaultNRRDS = [VFB_0010101b, VFB_001012vj, VFB_00101567];

class NRRDExample extends Component {
  constructor(props) {
    super(props);
    this.tooltipRef = React.createRef();
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
        rotateSpeed: 0.2,
        wireframe: false,
      },
      showModel: false,
      selectedVolume: 0,
      anchorEl : null
    };
    this.canvasIndex = 3;
    this.hoverHandler = this.hoverHandler.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.toggleVolume = this.toggleVolume.bind(this);
    this.onSelection = this.onSelection.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onMount = this.onMount.bind(this);
    this.layoutRef = React.createRef();
    this.volumes = defaultNRRDS;
    loadInstances(this.volumes[0]);
    this.setState({
      showModel: true,
      showLoader: false,
      data: getProxyInstances(),
      cameraOptions: { ...this.state.cameraOptions },
      anchorEl : null
    });
  }

  handleClick (event) {
    this.setState({ anchorEl : event.currentTarget });
  }
  handleClose () {
    this.setState({ anchorEl : null });
  }

  hoverHandler(objs, canvasX, canvasY) {
    this.tooltipRef?.current?.updateIntersected({
      o: objs[objs.length - 1],
      x: canvasX,
      y: canvasY,
    });
  }

  handleToggle() {
    this.setState({ showLoader: true });
    loadInstances(this.volumes[this.state.selectedVolume]);
    this.setState({
      showModel: true,
      showLoader: false,
      data: getProxyInstances(),
      cameraOptions: { ...this.state.cameraOptions },
      anchorEl : null
    });
  }

  toggleVolume(event, indexVolume) {
    this.setState({ showLoader: true });
    getInstance(this.volumes[indexVolume]).visualValue.nrrd = this.volumes[indexVolume];
    loadInstances(this.volumes[indexVolume]);
    this.setState({
      data: getProxyInstances(),
      selectedVolume: indexVolume,
      showModel: true,
      showLoader: false,
      cameraOptions: { ...this.state.cameraOptions },
      anchorEl : null
    });
  }

  onMount(scene) {}

  onSelection(selectedInstances) {}

  render() {
    const { data, cameraOptions, showModel, showLoader } = this.state;
    const canvasData = mapToCanvasData(data);
    const { classes } = this.props;
    const that = this;

    const captureOptions = {
      captureControls: {
        instance: CaptureControls,
        props: {},
      },
      recorderOptions: {
        mediaRecorderOptions: {
          mimeType: "video/webm",
        },
        blobOptions: {
          type: "video/webm",
        },
      },
      screenshotOptions: {
        resolution: {
          width: 3840,
          height: 2160,
        },
        quality: 0.95,
        pixelRatio: 1,
        filter: () => true,
      },
    };

    return showLoader ? (
      <Loader active={true} />
    ) : showModel ? (
      <div ref={(node) => (this.node = node)} className={classes.container}>
        <div>
          <Button
            id="basic-button"
            aria-controls={ this.state.anchorEl ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={this.state.anchorEl ? "true" : undefined}
            onClick={this.handleClick}
            className={classes.button}
          >
            Toggle Volume
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={this.state.anchorEl}
            open={this.state.anchorEl != null && this.state.anchorEl != undefined }
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            {defaultNRRDS.map((option, index) => (
              <MenuItem
                key={option}
                disabled={index === 0}
                selected={index === this.state.selectedVolume}
                onClick={ event => that.toggleVolume(event, index)}
              >
                {option}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={cameraOptions}
            captureOptions={captureOptions}
            backgroundColor={0xffffff}
            onSelection={this.onSelection}
            onMount={this.onMount}
            id="canvas"
            className="canvas"
            key={this.state.selectedVolume}
            hoverListeners={[this.hoverHandler]}
          />
        </>
      </div>
    ) : (
      <Button variant="outlined" color="primary" onClick={this.handleToggle}>
        Show Example
      </Button>
    );
  }
}

export default withStyles(styles)(NRRDExample);
