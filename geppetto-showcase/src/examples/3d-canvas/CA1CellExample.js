import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import Button from "@material-ui/core/Button";
import Loader from '@metacell/geppetto-meta-ui/loader/Loader';
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import { applySelection, mapToCanvasData } from "./utils/SelectionUtils";
import CanvasTooltip from './utils/CanvasTooltip';

const INSTANCE_NAME = 'network_CA1PyramidalCell';
const COLORS = [
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
class CA1Example extends Component {
  constructor (props) {
    super(props);
    this.canvasRef = React.createRef();
    this.tooltipRef = React.createRef();
    this.state = {
      showLoader: false,
      hasModelLoaded: false,
      data: [
        {
          instancePath: 'network_CA1PyramidalCell.CA1_CG[0]',
          visualGroups: {
            index: 4,
            custom: {
              soma_group: { color: COLORS[0], },
              dendrite_group: { color: COLORS[1], },
              axon_group: { color: COLORS[2], },
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

    this.onSelection = this.onSelection.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.hoverListener = this.hoverListener.bind(this);
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

  async handleToggle () {
    this.setState({ showLoader: true })
    const response = await fetch('../assets/ca1_model.json');
    const model = await response.json();
    Manager.loadModel(model);
    Instances.getInstance(INSTANCE_NAME);
    this.setState({ hasModelLoaded: true, showLoader:false })
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  hoverListener (objs, canvasX, canvasY) {
    this.tooltipRef?.current?.updateIntersected({
      o: objs[objs.length - 1],
      x: canvasX,
      y: canvasY,
    });
  }

  render () {
    const { classes } = this.props;
    const { data, cameraOptions, showLoader, hasModelLoaded } = this.state;
    const canvasData = mapToCanvasData(data)


    return showLoader ? <Loader active={true}/>
      : hasModelLoaded ? (
        <div ref={node => this.node = node} className={classes.container}>
          <div id={'canvas-tooltips-container'}>
            <div>
              <CanvasTooltip ref={this.tooltipRef} />
            </div>
          </div>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={cameraOptions}
            onSelection={this.onSelection}
            linesThreshold={10000}
            backgroundColor={0x505050}
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

export default withStyles(styles)(CA1Example);
