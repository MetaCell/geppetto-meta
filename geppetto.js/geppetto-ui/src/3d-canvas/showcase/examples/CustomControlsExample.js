import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@material-ui/core';
import neuron from '../assets/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf';
import contact from '../assets/Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf';
import Button from "@material-ui/core/Button";
import { applySelection, mapToCanvasData } from "../utils/SelectionUtils";
import Resources from '@metacell/geppetto-meta-core/Resources';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';
import CanvasTooltip from "../utils/CanvasTooltip";
import { faFill, } from '@fortawesome/free-solid-svg-icons';

const instance1spec = {
  "eClass": "SimpleInstance",
  "id": "ANeuron",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": Resources.GLTF,
    'gltf': neuron
  }
}
import IconButtonWithTooltip from '../../../common/IconButtonWithTooltip';

const instance2spec = {
  "eClass": "SimpleInstance",
  "id": "AContact",
  "name": "The second SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": Resources.GLTF,
    'gltf': contact
  }
}

function loadInstances () {
  ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(instance1spec)
  const instance2 = new SimpleInstance(instance2spec)
  window.Instances = [instance1, instance2]
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
});

const ACTIONS = { CHANGE_BACKGROUND_COLOR: 'change_background_color' }
const BACKGROUND_COLORS = [0x505050, 0xe6e6e6, 0x000000]

class CustomCameraControls extends Component {
  constructor (props) {
    super(props);
  }


  render () {
    const { cameraControlsHandler, } = this.props;
    const buttons = [
      {
        action: ACTIONS.CHANGE_BACKGROUND_COLOR,
        tooltip: 'Change background color',
        icon: faFill,
      },
    ];
    return (
      <div className="position-toolbar">
        {buttons.map((value, index) => (
          <IconButtonWithTooltip
            key={index}
            disabled={false}
            onClick={() => cameraControlsHandler(value.action)}
            className={`squareB`}
            tooltip={value.tooltip}
            icon={value.icon}
          />
        ))}
      </div>
    );
  }
}

class CustomControlsExample extends Component {
  constructor (props) {
    super(props);
    this.tooltipRef = React.createRef();
    loadInstances()
    this.customCameraHandler = this.customCameraHandler.bind(this)
    this.state = {
      data: getProxyInstances(),
      showLoader: false,
      cameraOptions: {
        angle: 50,
        near: 0.01,
        far: 1000,
        baseZoom: 1,
        cameraControls: {
          instance: CustomCameraControls,
          props: { cameraControlsHandler: this.customCameraHandler },
        },
        reset: false,
        autorotate: false,
        wireframe: false,
      },
      backgroundColorIndex: 0,
      showModel: false
    };
    this.canvasIndex = 3
    this.hoverHandlerOne = this.hoverHandlerOne.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.onSelection = this.onSelection.bind(this)
    this.layoutRef = React.createRef();
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }


  hoverHandlerOne (objs, canvasX, canvasY) {
    this.tooltipRef?.current?.updateIntersected({
      o: objs[objs.length - 1],
      x: canvasX,
      y: canvasY,
    });
  }

  hoverHandlerTwo (objs, canvasX, canvasY) {
    console.log(objs)
  }

  handleToggle () {
    this.setState({ showLoader: true })
    loadInstances()
    this.setState({
      showModel: true,
      showLoader: false,
      data: getProxyInstances(),
    })
  }

  handleClickOutside (event) {
    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth) {
        this.setState({ showModel: false })
      }
    }
  }

  onSelection (selectedInstances) {
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  customCameraHandler (action) {
    switch (action){
    case ACTIONS.CHANGE_BACKGROUND_COLOR:
      this.setState({ backgroundColorIndex: this.nextBackgroundColor() })
      break
    }
  }

  nextBackgroundColor (){
    const { backgroundColorIndex } = this.state
    return backgroundColorIndex >= BACKGROUND_COLORS.length ? 0 : backgroundColorIndex + 1
  }

  render () {
    const { data, cameraOptions, showModel, showLoader, backgroundColorIndex } = this.state
    const canvasData = mapToCanvasData(data)
    const { classes } = this.props

    return showLoader ? <Loader active={true}/> : showModel ? (
      <div ref={node => this.node = node} className={classes.container}>
        <>
          <div>
            <CanvasTooltip ref={this.tooltipRef}/>
          </div>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={cameraOptions}
            backgroundColor={BACKGROUND_COLORS[backgroundColorIndex]}
            onSelection={this.onSelection}
            onHoverListeners={{ 'hoverId1': this.hoverHandler }}
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

export default withStyles(styles)(CustomControlsExample);
