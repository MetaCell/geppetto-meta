import React, { Component } from 'react';
import * as FlexLayout from '@geppettoengine/geppetto-ui/flex-layout/src';
import Canvas from "@geppettoengine/geppetto-ui/3d-canvas/Canvas";
import CameraControls from "@geppettoengine/geppetto-ui/camera-controls/CameraControls";
import { getInstances, json } from "./util";

class CanvasPoc extends Component {
  constructor (props) {
    super(props);
    this.state = {
      model: FlexLayout.Model.fromJson(json),
      data: getInstances(),
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
        position: { x: 0, y: 0, z: 0 },
        rotation: { rx: 0, ry: 0, rz: 0, radius: 0 },
      },
    };
    this.canvasIndex = 3
    this.lastCameraUpdate = null;
    this.cameraHandler = this.cameraHandler.bind(this);
    this.selectionHandler = this.selectionHandler.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.layoutRef = React.createRef();
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.canvas !== this.props.canvas) {
      this.layoutRef.current.addTabWithDragAndDropIndirect("Add new<br>(Drag to location)", {
        component: "canvas",
        name: "Canvas " + this.canvasIndex++
      })
    }
  }

  factory (node) {
    const { data, cameraOptions } = this.state
    let camOptions = cameraOptions;
    if (this.lastCameraUpdate) {
      camOptions = {
        ...cameraOptions,
        position: this.lastCameraUpdate.position,
        rotation: this.lastCameraUpdate.rotation,
      };
    }
    return <div>
      <Canvas
        data={data}
        cameraOptions={camOptions}
        cameraHandler={this.cameraHandler}
        selectionHandler={this.selectionHandler}
        backgroundColor={0x505050}
        hoverListeners={[this.hoverHandler]}
      /></div>;
  }

  cameraHandler (obj) {
    console.log("camera handler" + obj)
    this.lastCameraUpdate = obj;

  }

  selectionHandler (selectedMap) {
    console.log("selection handler" + selectedMap)
  }

  hoverHandler (obj) {
    console.log("hover handler" + obj)
  }


  render () {
    return (
      <div>
        <FlexLayout.Layout
          ref={this.layoutRef}
          model={this.state.model}
          factory={this.factory.bind(this)}
        />
      </div>

    );
  }
}

export default CanvasPoc;