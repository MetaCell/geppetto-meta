import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Canvas from '../../Canvas';
import CameraControls from '../../../camera-controls/CameraControls';
import Button from "@material-ui/core/Button";
import Loader from "../../../loader/Loader";
import { applySelection, mapToCanvasData } from "./SelectionUtils";
import CanvasTooltip from './CanvasTooltip'

const INSTANCE_NAME = 'network_CA1PyramidalCell';
const INIT_COLORS = [
  { r: 0, g: 0.29, b: 0.71, a: 1 },
  { r: 0.43, g: 0.57, b: 0, a: 1 },
  { r: 1, g: 0.41, b: 0.71, a: 1 },
];
const styles = () => ({
  container: {
    height: '800px',
    width: '1240px',
    display: 'flex',
    alignItems: 'stretch',
  }
});
class ColorChange extends Component {
  constructor (props) {
    super(props);
    this.canvasRef = React.createRef();

    this.state = {
      showLoader: false,
      hasModelLoaded: false,
      intersected: [],
      tooltipVisible: false,
      backgroundColor: 0x505050,
      data: [
        {
          instancePath: 'network_CA1PyramidalCell.CA1_CG[0]',
          visualGroups: {
            index: 4,
            custom: {
              soma_group: { color: INIT_COLORS[0], },
              dendrite_group: { color: INIT_COLORS[1], },
              axon_group: { color: INIT_COLORS[2], },
            },
          },
        },
      ],
      selected: {},
      cameraOptions: {
        angle: 60,
        near: 10,
        far: 2000000,
        baseZoom: 1,
        position: { x: -97.349, y: 53.797, z: 387.82 },
        rotation: { rx: 0.051, ry: -0.192, rz: -0.569, radius: 361.668 },
        autoRotate: false,
        movieFilter: true,
        reset: false,
        cameraControls: { 
          instance: CameraControls,
          props: {}
        },
      },
    };

    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.onSelection = this.onSelection.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.hoverListener = this.hoverListener.bind(this);
  }

  randomizeColor() {
    this.setState({ backgroundColor: Math.floor(Math.random() * 10000) })
    setTimeout(()=>{
      this.randomizeColor();
    },1500);
  }
  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
    this.randomizeColor();
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

  async handleToggle () {
    this.setState({ showLoader: true })
    const response = await fetch('../assets/ca1_model.json');
    const model = await response.json();
    GEPPETTO.Manager.loadModel(model);
    Instances.getInstance(INSTANCE_NAME);
    this.setState({ hasModelLoaded: true, showLoader:false })
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  hoverListener(objs, canvasX, canvasY) {
    this.state.intersected = [];
    objs.forEach((o)=>{
      this.state.intersected.push({ o: o, x: canvasX, y: canvasY });
    })
    this.setState({ intersected: this.state.intersected, tooltipVisible: true });

    setTimeout(()=>{
      this.setState({ tooltipVisible: false})
    },1500);
  }

  render () {
    const { classes } = this.props;
    const { data, cameraOptions, showLoader, hasModelLoaded } = this.state;
    const canvasData = mapToCanvasData(data)

    let camOptions = cameraOptions;
    if (this.lastCameraUpdate) {
      camOptions = {
        ...cameraOptions,
        position: this.lastCameraUpdate.position,
        rotation: {
          ...this.lastCameraUpdate.rotation,
          radius: cameraOptions.rotation.radius,
        },
      };
    }

    return showLoader ? <Loader active={true}/>
      : hasModelLoaded ? (
        <div ref={node => this.node = node} className={classes.container}>
          <div id={'canvas-tooltips-container'}>
            <div>
              { this.state.intersected.length > 0 && 
                <CanvasTooltip 
                  visible={ this.state.tooltipVisible } 
                  x={this.state.intersected[this.state.intersected.length -1].x} 
                  y={this.state.intersected[this.state.intersected.length -1].y} 
                  text={this.state.intersected[this.state.intersected.length -1].o.object.uuid} 
                  id={'canvas-tooltip-' + this.state.intersected[this.state.intersected.length -1].o.object.uuid}>
                </CanvasTooltip>
              }
            </div>
          </div>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={camOptions}
            cameraHandler={this.cameraHandler}
            onSelection={this.onSelection}
            linesThreshold={10000}
            backgroundColor={this.state.backgroundColor}
            hoverListeners={[this.hoverListener]}
          />
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

export default withStyles(styles)(ColorChange);
