import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import { withStyles } from '@material-ui/core';
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/showcase/examples/SelectionUtils";

const styles = () => ({
    canvasContainer: {
        display: 'flex',
        alignItems: 'stretch',
    },
});

class CanvasExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            cameraOptions: {
                angle: 50,
                near: 0.01,
                far: 1000,
                baseZoom: 1,
                cameraControls: {
                    instance: CameraControls,
                    props: { wireframeButtonEnabled: false, },
                },
                reset: false,
                autorotate: false,
                wireframe: false,
            },
        };
        this.canvasIndex = 3
        this.lastCameraUpdate = null;
        this.cameraHandler = this.cameraHandler.bind(this);
        this.onSelection = this.onSelection.bind(this)
        this.onMount = this.onMount.bind(this);
        this.layoutRef = React.createRef();
    }

    cameraHandler(obj) {
        this.lastCameraUpdate = obj;
    }

    onMount(scene) {
        console.log(scene)
    }

    onSelection(selectedInstances) {
        this.setState({ data: applySelection(this.state.data, selectedInstances) })
    }

    render() {
        const { data, cameraOptions } = this.state
        const canvasData = mapToCanvasData(data)
        const { classes } = this.props
        let camOptions = cameraOptions;
        if (this.lastCameraUpdate) {
            camOptions = {
                ...cameraOptions,
                position: this.lastCameraUpdate.position,
                rotation: this.lastCameraUpdate.rotation,
            };
        }
        return <div className={classes.container}>
            <Canvas
                data={canvasData}
                cameraOptions={camOptions}
                cameraHandler={this.cameraHandler}
                backgroundColor={0x505050}
                onSelection={this.onSelection}
                onMount={this.onMount}
            />
        </div>
    }
}

export default withStyles(styles)(CanvasExample);