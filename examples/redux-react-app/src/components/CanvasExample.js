import React from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import { makeStyles } from '@material-ui/core';
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/showcase/utils/SelectionUtils";
import { connect } from 'react-redux';


const useStyles = makeStyles(() => ({
    canvasContainer: {
        height: '100%',
        width: '100%',
    },
}));

const mapStateToProps = state => {
    return {
        canvasData: state.exampleState.instances
    }
}

function CanvasExample(props) {
    const style = useStyles();
    const [data, setData] = React.useState(props.canvasData);
    const [cameraOptions, setCameraOptions] = React.useState({
        angle: 50,
        near: 0.01,
        far: 1000,
        baseZoom: 1,
        cameraControls: {
            instance: CameraControls,
            props: {
                wireframeButtonEnabled: false,
            }
        }
    });
    const [canvasIndex, setCanvasIndex] = React.useState(3);
    const [lastCameraUpdate, setLastCameraUpdate] = React.useState(null);
    const ref = React.useRef();

    const onMount = (scene) => {
        console.log('scene', scene);
    }


    const cameraHandler = (obj) => {
        setLastCameraUpdate(obj);
    }

    const onSelection = (selectedInstances) => {
        setData(applySelection(data, selectedInstances));
    }

    const canvasData = mapToCanvasData(data);
    const classes = props.classes;
    let camOptions = cameraOptions;

    if (lastCameraUpdate) {
        camOptions = {
            ...cameraOptions,
            // @ts-ignore
            position: lastCameraUpdate.position,
            rotation: lastCameraUpdate.rotation,
        }
    }

    return (
        <div className={style.canvasContainer}>
            <Canvas
                ref={ref}
                data={canvasData}
                cameraOptions={camOptions}
                cameraHandler={cameraHandler}
                backgroundColor={0x505050}
                onSelection={onSelection}
                onMount={onMount}
            />
        </div>
    )
}

export default connect(mapStateToProps)(CanvasExample);