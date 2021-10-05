import React, { Component } from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import { withStyles } from '@material-ui/core';
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/showcase/examples/SelectionUtils";
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import neuron from "@metacell/geppetto-meta-ui/3d-canvas/showcase/examples/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf";
import contact from "@metacell/geppetto-meta-ui/3d-canvas/showcase/examples/Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf";

const styles = () => ({
    canvasContainer: {
        height: '100%',
        width: '100%',
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

    componentDidMount () {
        console.log('window', window);
        const instance1spec = {
            "eClass": "SimpleInstance",
            "id": "ANeuron",
            "name": "The first SimpleInstance to be render with Geppetto Canvas",
            "type": { "eClass": "SimpleType" },
            "visualValue": {
              "eClass": window.GEPPETTO.Resources.GLTF,
              'gltf': neuron
            }
        }
        const instance2spec = {
            "eClass": "SimpleInstance",
            "id": "AContact",
            "name": "The second SimpleInstance to be render with Geppetto Canvas",
            "type": { "eClass": "SimpleType" },
            "visualValue": {
                "eClass": window.GEPPETTO.Resources.GLTF,
                'gltf': contact
            }
        }
        const instance1 = new SimpleInstance(instance1spec);
        const instance2 = new SimpleInstance(instance2spec)

        window.Instances = [instance1, instance2]
        window.GEPPETTO.Manager.augmentInstancesArray(window.Instances);
        console.log('Instances', window.Instances);
        console.log('window', window);

        this.setState({ ...this.state, data: window.Instances.map(i => ({ instancePath: i.getId(), color: { r: 0, g: 0.2, b: 0.6, a: 1 } }))});

    }

    render() {
        const { data, cameraOptions } = this.state
        const canvasData = mapToCanvasData(data)
        console.log('canvasData', canvasData);
        const { classes } = this.props
        let camOptions = cameraOptions;
        if (this.lastCameraUpdate) {
            camOptions = {
                ...cameraOptions,
                position: this.lastCameraUpdate.position,
                rotation: this.lastCameraUpdate.rotation,
            };
        }
        return <div className={classes.canvasContainer}>
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