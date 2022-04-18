import React from 'react';
import Canvas from "@metacell/geppetto-meta-ui/3d-canvas/Canvas";
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import CanvasTooltip from "@metacell/geppetto-meta-ui/3d-canvas/showcase/utils/CanvasTooltip";
import CameraControls from "@metacell/geppetto-meta-ui/camera-controls/CameraControls";
import { makeStyles } from '@material-ui/core';
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/showcase/utils/SelectionUtils";
import { connect } from 'react-redux';

// @ts-ignore
const ca1_model_json = require('./resources/ca1_model.json');

const INSTANCE_NAME = 'network_CA1PyramidalCell';

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

const COLORS = [
    { r: 0, g: 0.29, b: 0.71, a: 1 },
    { r: 0.43, g: 0.57, b: 0, a: 1 },
    { r: 1, g: 0.41, b: 0.71, a: 1 },
];

function CanvasExample(props) {
    const style = useStyles();
    const [data, setData] = React.useState([
        {
            instancePath: 'network_CA1PyramidalCell.CA1_CG[0]',
            visualGroups: {
                index: 4,
                custome: {
                    soma_group: { color: COLORS[0], },
                    dendrite_group: { color: COLORS[1], },
                    axon_group: { color: COLORS[2], }
                },
            },
        },
    ]);
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

    const ref = React.createRef();
    const [showLoader, setShowLoader] = React.useState(true);
    const [hasModelLoaded, setHasModelLoaded] = React.useState(false);
    const tooltipRef = React.useRef(null);


    React.useEffect(() => {
        setShowLoader(true); //temporary

        const model = ca1_model_json;
        window.GEPPETTO.Manager.loadModel(model);
        setHasModelLoaded(true);
        setShowLoader(false);
        window.Instances.getInstance(INSTANCE_NAME);

    }, []);

    const onMount = (scene) => {
        console.log('scene', scene);
    }

    const onSelection = (selectedInstances) => {
        setData(applySelection(data, selectedInstances));
    }

    const hoverListener = (objs, canvasX, canvasY) => {
        tooltipRef?.current?.updateIntersected({
            o: objs[objs.length - 1],
            x: canvasX,
            y: canvasY,
        });
    }

    const onEmptyHoverListener = () => {
      tooltipRef?.current?.updateIntersected(null);
    }

    const canvasData = mapToCanvasData(data);
    let camOptions = cameraOptions;


    return (
        showLoader ? <Loader active={true} /> :
        hasModelLoaded ? (
            <div className={style.canvasContainer}>
                <div id={'canvas-tooltips-container'}>
                    <div>
                        <CanvasTooltip
                            ref={tooltipRef}
                        />
                        
                    </div>
                </div>
            
                <div className={style.canvasContainer}>
                    <Canvas
                        ref={ref}
                        data={canvasData}
                        cameraOptions={camOptions}
                        backgroundColor={0x505050}
                        onSelection={onSelection}
                        hoverListeners={[hoverListener]}
                        onMount={onMount}
                    />
                </div>
            </div>
        ) : null
    )
}

export default connect(mapStateToProps)(CanvasExample);