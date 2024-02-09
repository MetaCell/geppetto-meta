import React, { Component } from 'react';
import * as THREE from 'three';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import { withStyles } from '@mui/material';
import neuron from './assets/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf';
import contact from './assets/Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf';
import Button from "@material-ui/core";
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils"
import Resources from '@metacell/geppetto-meta-core/Resources';
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';
import { faFill, faCamera, faHandPointDown, faMousePointer, faCubes } from '@fortawesome/free-solid-svg-icons';

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
import IconButtonWithTooltip from '@metacell/geppetto-meta-ui/common/IconButtonWithTooltip';
import { selectionStrategies } from "@metacell/geppetto-meta-ui/3d-canvas/threeDEngine/SelectionManager";

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

const ACTIONS = {
  CHANGE_BACKGROUND_COLOR: 'change_background_color',
  CHANGE_CAMERA: 'change_camera',
  CHANGE_SELECTION_STRATEGY: 'change_selection_strategy',
  CHANGE_HOVER_LISTENERS: 'change_hover_listeners',
  CHANGE_THREE_D_OBJECTS: 'change_three_d_objects',
}
const geometry = new THREE.SphereGeometry( 500, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const sphere = new THREE.Mesh( geometry, material );
const axis = new THREE.AxesHelper( 50000 )

const BACKGROUND_COLORS = [0x505050, 0xe6e6e6, 0x000000]
const THREE_D_OBJECTS = [[axis], [axis, sphere], [sphere]]

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
      {
        action: ACTIONS.CHANGE_CAMERA,
        tooltip: 'Randomize camera',
        icon: faCamera,
      },
      {
        action: ACTIONS.CHANGE_SELECTION_STRATEGY,
        tooltip: 'Change selection strategy',
        icon: faMousePointer,
      },
      {
        action: ACTIONS.CHANGE_HOVER_LISTENERS,
        tooltip: 'Change hover listeners',
        icon: faHandPointDown,
      },
      {
        action: ACTIONS.CHANGE_THREE_D_OBJECTS,
        tooltip: 'Change 3D objects',
        icon: faCubes,
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
            style={{ marginTop: `${index * 30}px` }}
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
    this.hoverHandlerOne = this.hoverHandlerOne.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.onSelection = this.onSelection.bind(this)
    this.defaultCameraOptions = {
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
    }
    this.defaultHoverListeners = { 'hoverId1': this.hoverHandlerOne }
    this.state = {
      data: getProxyInstances(),
      showLoader: false,
      cameraOptions: this.defaultCameraOptions,
      backgroundColorIndex: 0,
      showModel: false,
      selectionStrategyIndex: 0,
      threeDObjectsIndex: 0,
      hoverListeners: this.defaultHoverListeners
    };
    this.scene = null
    this.layoutRef = React.createRef();
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  hoverHandlerOne (objs, canvasX, canvasY) {

  }

  hoverHandlerTwo (objs, canvasX, canvasY) {
    console.log("Hello from the new hover listener, here's what I have for you:")
    console.log(objs, canvasX, canvasY)
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
    switch (action) {
    case ACTIONS.CHANGE_BACKGROUND_COLOR:
      this.setState({ backgroundColorIndex: this.nextBackgroundColor() })
      break
    case ACTIONS.CHANGE_CAMERA:
      // eslint-disable-next-line no-case-declarations
      const nextCameraOptions = this.getCameraOptions()
      // Fixme: This reset behaviour is a bit strange
      this.setState({ cameraOptions: nextCameraOptions }, () => this.setState({
        cameraOptions: {
          ...nextCameraOptions,
          reset: false
        }
      }))
      break
    case ACTIONS.CHANGE_SELECTION_STRATEGY:
      this.setState({ selectionStrategyIndex: this.nextSelectionStrategy() })
      break
    case ACTIONS.CHANGE_HOVER_LISTENERS:
      this.setState({ hoverListeners: this.getHoverListeners() })
      break
    case ACTIONS.CHANGE_THREE_D_OBJECTS:
      this.setState({ threeDObjectsIndex: this.nextThreeDObject() })
      break
    }

  }

  nextBackgroundColor () {
    const { backgroundColorIndex } = this.state
    return backgroundColorIndex >= BACKGROUND_COLORS.length - 1 ? 0 : backgroundColorIndex + 1
  }

  nextSelectionStrategy () {
    const { selectionStrategyIndex } = this.state
    return selectionStrategyIndex >= Object.keys(selectionStrategies).length - 1 ? 0 : selectionStrategyIndex + 1
  }

  getHoverListeners () {
    const { hoverListeners } = this.state
    const nextHoverListeners = this.defaultHoverListeners

    return Object.keys(hoverListeners).includes('hoverId2') ? nextHoverListeners : {
      ...nextHoverListeners,
      'hoverId2': this.hoverHandlerTwo
    }
  }

  nextThreeDObject () {
    const { threeDObjectsIndex } = this.state
    return threeDObjectsIndex >= THREE_D_OBJECTS.length - 1 ? 0 : threeDObjectsIndex + 1
  }

  getCameraOptions () {
    const { x, y, z } = this.scene.children[0].position

    function randomNumber (min, max) {
      return Math.random() * (max - min) + min;
    }

    function random () {
      return randomNumber(0.5, 1.5)
    }

    const initialPosition = this.scene ? { x: x * random(), y: y * random(), z: z * random() } : null
    return { ...this.defaultCameraOptions, reset: true, initialPosition }
  }

  render () {
    const {
      data, cameraOptions, showModel, showLoader, backgroundColorIndex, selectionStrategyIndex,
      hoverListeners, threeDObjectsIndex
    } = this.state
    const canvasData = mapToCanvasData(data)
    const { classes } = this.props

    return showLoader ? <Loader active={true}/> : showModel ? (
      <div ref={node => this.node = node} className={classes.container}>
        <>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            cameraOptions={cameraOptions}
            backgroundColor={BACKGROUND_COLORS[backgroundColorIndex]}
            onMount={scene => this.scene = scene}
            onSelection={this.onSelection}
            selectionStrategy={selectionStrategies[Object.keys(selectionStrategies)[selectionStrategyIndex]]}
            onHoverListeners={hoverListeners}
            threeDObjects={THREE_D_OBJECTS[threeDObjectsIndex]}
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
