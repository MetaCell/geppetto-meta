import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas'; 
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import Button from "@material-ui/core/Button";
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import { applySelection, mapToCanvasData } from "./utils/SelectionUtils";
import CanvasTooltip from "./utils/CanvasTooltip";

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

class AuditoryCortexExample extends Component {
  constructor (props) {
    super(props);
    this.canvasRef = React.createRef();
    this.tooltipRef = React.createRef();
    this.state = {
      hasModelLoaded: false,
      showLoader: false,
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
        cameraControls: {
          instance: CameraControls,
          props: { wireframeButtonEnabled: false, },
        },
        reset: false,
        autorotate: false,
        wireframe: false,
        initialPosition: { x: 230.357, y: 256.435, z: 934.238 },
        initialRotation: { rx: -0.294, ry: -0.117, rz: -0.02, radius: 531.19 },
      },
    };

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
      if (event.offsetX <= event.target.clientWidth) {
        this.setState({ hasModelLoaded: false })
      }
    }
  }

  async handleToggle () {
    this.setState({ showLoader: true })

    const response = await fetch('../assets/acnet_model.json');
    const model = await response.json();
    Manager.loadModel(model);
    Instances.getInstance(INSTANCE_NAME);
    this.setState({ hasModelLoaded: true, showLoader: false });
  }

  hoverHandler (objs, canvasX, canvasY) {
    this.tooltipRef?.current?.updateIntersected({
      o: objs[objs.length - 1],
      x: canvasX,
      y: canvasY,
    });
  }

  onSelection (selectedInstances) {
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  render () {
    const { classes } = this.props;
    const { data, cameraOptions, hasModelLoaded, showLoader } = this.state;
    const canvasData = mapToCanvasData(data)


    return showLoader ? <Loader active={true}/> : hasModelLoaded ? (
      <div ref={node => this.node = node} className={classes.container}>
        <div>
          <CanvasTooltip ref={this.tooltipRef}/>
        </div>
        <Canvas
          ref={this.canvasRef}
          data={canvasData}
          cameraOptions={cameraOptions}
          onSelection={this.onSelection}
          backgroundColor={0x505050}
          onHoverListeners={{ 'hoverId':this.hoverHandler }}
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

export default withStyles(styles)(AuditoryCortexExample);
