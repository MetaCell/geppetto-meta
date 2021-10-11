import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Canvas from '../../Canvas';
import CameraControls from '../../../camera-controls/CameraControls';
import Button from "@material-ui/core/Button";
import Loader from "../../../loader/Loader";
import { applySelection, mapToCanvasData } from "./SelectionUtils";
import CanvasTooltip from './CanvasTooltip'

const INSTANCE_NAME = 'acnet2_color';
const COLORS = [
  { r: 0, g: 0.29, b: 0.71, a: 0.25 },
  { r: 0.43, g: 0.57, b: 0, a: 0.25 },
  { r: 1, g: 0.41, b: 0.71, a: 0.25 },
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
          instancePath: 'acnet2.baskets_12[7]',
          color: COLORS[1],
        },
      ],
      selected: {},
      cameraOptions: {
        angle: 60,
        near: 10,
        far: 2000000,
        baseZoom: 1,
        position: { x: 230.357, y: 256.435, z: 934.238 },
        rotation: { rx: -0.294, ry: -0.117, rz: -0.02, radius: 531.19 },
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

  changeBgCOlor() {
    const newColor = '0x'+(Math.floor(Math.random() * 10000000)).toString(16);
    this.setState({ backgroundColor: eval(newColor) })
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

  async handleToggle () {
    this.setState({ showLoader: true })
    const response = await fetch('../assets/acnet_model.json');
    const model = await response.json();
    GEPPETTO.Manager.loadModel(model);
    Instances.getInstance(INSTANCE_NAME);
    this.setState({ hasModelLoaded: true, showLoader:false })
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  hoverListener(objs, canvasX, canvasY) {

  }

  newInstanceExists() {
    const instancePath = 'acnet2.baskets_12[0]';
    const instance = this.state.data.filter((i) => { return i.instancePath === instancePath });
    return instance.length > 0 ;
  }

  addInstance() {
    if (!this.newInstanceExists())
    {
      const newData = this.state.data;
      newData.push({
        instancePath: 'acnet2.baskets_12[0]',
        color: COLORS[2],
      },);
      this.setState({ data: newData })
    }
  }

  removeInstance() {
    if (this.newInstanceExists())
    {
      const newData = this.state.data.filter((i)=> { return (i.instancePath !== 'acnet2.baskets_12[0]') });
      this.setState({ data: newData })
    }
  }

  changeSameColor() {
    const newData = this.state.data;
    this.setState({ data: newData })
  }


  changeColor() {
    const newData = this.state.data;
    newData[0].color = { r: Math.random(), g: Math.random(), b: Math.random(), a: 0.25}
    this.setState({ data: newData })
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
          radius: this.lastCameraUpdate.rotation.radius,
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
          <div>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { this.addInstance() } }>Add Instance</Button><br/>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { this.removeInstance() } } >Remove Instance</Button><br/>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { this.changeColor() } }>Change Color</Button><br/>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { this.changeSameColor() } }>Change Same Color</Button><br/>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { this.changeBgCOlor() } }>Change Bg Color</Button><br/>
          </div>
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
