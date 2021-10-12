import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import ModelManager from '@metacell/geppetto-meta-core/ModelManager';

import Canvas from '../../Canvas';
import CameraControls from '../../../camera-controls/CameraControls';
import { applySelection, mapToCanvasData } from "./SelectionUtils";

const INSTANCE_NAME = 'acnet2';
const COLORS = [
  { r: 0, g: 0.2, b: 0.6, a: 1 },
  { r: 0.8, g: 0, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 0.5 },
];

const styles = () => ({
  container: {
    height: '800px',
    width: '1240px',
    display: 'flex',
    alignItems: 'stretch',
  },
});

class AuditoryCortexExample2 extends Component {
  constructor (props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      showLoader: false,
      hasModelLoaded: false,
      data: [
        {
          instancePath: 'acnet2.baskets_12',
          color: COLORS[1],
        },
        { instancePath: 'acnet2' },
        {
          instancePath: 'acnet2.baskets_12[0]',
          color: COLORS[2],
        },
        {
          instancePath: 'acnet2.baskets_12[7]',
          color: COLORS[3],
        },
      ],
      selected: {},
      cameraOptions: {
        angle: 60,
        near: 10,
        far: 2000000,
        baseZoom: 1,
        zoomTo: ['acnet2.baskets_12[7]'],
        cameraControls: { 
          instance: CameraControls,
          props: { wireframeButtonEnabled: false, },
          incrementPan: {
            x:0.05,
            y:0.05
          },
          incrementRotation: {
            x:0.05,
            y:0.05,
            z:0.05,
          },
          incrementZoom: 0.5,
          reset: false,
        },
        movieFilter: false,
        autorotate:false,
        wireframe:false
      },
    };

    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.onSelection = this.onSelection.bind(this)
    this.hoverHandler = this.hoverHandler.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside (event) {

    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth){
        this.setState({ hasModelLoaded: false })
      }
    }
  }
  
  cameraHandler (obj) {
    this.lastCameraUpdate = obj;
  }


  hoverHandler (obj) {
    console.log('Hover handler called:');
  }

  async handleToggle () {
    this.setState({ showLoader: true })

    const response = await fetch('../assets/acnet_model.json');
    const model = await response.json();
    ModelManager.loadModel(model);
    Instances.getInstance(INSTANCE_NAME);
    this.setState({ hasModelLoaded: true, showLoader: false })
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  render () {
    const { classes } = this.props;
    const { data, cameraOptions, hasModelLoaded, showLoader } = this.state;
    const canvasData = mapToCanvasData(data)

    let camOptions = cameraOptions;
    if (this.lastCameraUpdate) {
      camOptions = {
        ...cameraOptions,
        position: this.lastCameraUpdate.position,
        zoomTo: [],
      };
      if (this.lastCameraUpdate.rotation.radius){
        camOptions = {
          ...cameraOptions,
          rotation: this.lastCameraUpdate.rotation,
        };
      }
    }

    return showLoader ? <Loader active={true}/> : hasModelLoaded ? (
      <div ref={node => this.node = node} className={classes.container}>
        <Canvas
          ref={this.canvasRef}
          data={canvasData}
          cameraOptions={camOptions}
          cameraHandler={this.cameraHandler}
          onSelection={this.onSelection}
          backgroundColor={0x505050}
          hoverListeners={[this.hoverHandler]}
        />
      </div>
    )
      : <Button
        variant="outlined"
        color="primary"
        onClick={this.handleToggle}
      >
          Show Example
      </Button>
  }
}

export default withStyles(styles)(AuditoryCortexExample2);
