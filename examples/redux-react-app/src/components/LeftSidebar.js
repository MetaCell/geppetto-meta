import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Drawer, FormControl, InputLabel, MenuItem, Select, Input } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { activateWidget, addWidget, deleteWidget, maximizeWidget, minimizeWidget, setLayout, updateWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { makeStyles } from '@material-ui/core/styles';
import { MyComponentWidget, ImageViewerWidget, DicomViewerWidget, CanvasWidget } from 'widgets';
import { layout } from 'app/layout';
import * as Actions from 'redux/actions';
import * as model from './resources/vfb_model';

const newTabset = {
    "type": "row",
    "weight": 31,
    "children": [
        {
            "type": "tabset",
            "weight": 100,
            "id": "newPanel",
            "enableDeleteWhenEmpty": false,
            "children": []
        }
    ]
}

const INSTANCES = [
    '',
    'VFB_00017894',
    'VFB_00030624',
    'VFB_00030622',
    'VFB_00030616',
    'VFB_00030633',
    'VFB_00030840',
    'VFB_00030632',
    'VFB_00030783',
];

const COLORS = [
    { r: 0.36, g: 0.36, b: 0.36, a: 1 },
    { r: 0, g: 1, b: 0, a: 1 },
    { r: 1, g: 0, b: 1, a: 1 },
    { r: 0, g: 0, b: 1, a: 1 },
    { r: 1, g: 0.83, b: 0, a: 1 },
    { r: 0, g: 0.52, b: 0.96, a: 1 },
    { r: 1, g: 0, b: 0, a: 1 },
];

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: theme.drawer.width
    },
    drawerContent: {
        width: theme.drawer.width,
        paddingTop: theme.spacing(10)
    },
    buttonGroup: {
        margin: theme.spacing(1)
    }
}));

/**
 * The left sidebar that hosts the demo buttons to interact with the application.
 */
const LeftSidebar = (props) => {
    const [instanceSelected, setInstance] = useState("");
    const [vfbModelLoaded, setVfbModel] = useState(false);

    const onLoad = () => {
        dispatch({ type: Actions.DATA_LOADING_START })

        setTimeout(() => {
            dispatch({ type: Actions.DATA_LOADING_END })
        }, 4000);
    }

    const dispatch = useDispatch();
    const classes = useStyles();

    // Click callbacks
    const onCustomWidgetClick = () => dispatch(addWidget(MyComponentWidget));
    const onAddWidgetClick = (widget) => dispatch(addWidget(widget));
    const onRemove = (id) => dispatch(deleteWidget(id));
    const onMaximize = (id) => dispatch(maximizeWidget(id));
    const onMinimize = (id) => dispatch(minimizeWidget(id));
    const onActivate = (id) => dispatch(activateWidget(id));
    const onUpdate = (widget) => dispatch(updateWidget({ ...widget, name: "Your Component!" }));
    const onChangeLayout = () => dispatch(setLayout({
        ...layout, "layout": {
            ...layout["layout"],
            "children": [
                ...layout['layout']['children'],
                newTabset
            ]
        }
    }));

    const widgets = useSelector(state => state.widgets)
    const exampleState = useSelector(state => state.exampleState)

    const handleChange = (event) => {
        setInstance(event.target.value);
    }

    var handleAddInstance = () => {
        if (!vfbModelLoaded) {
            window.GEPPETTO.Manager.loadModel(model.default);
            for (const iname of INSTANCES) {
                if (iname === "") {
                    continue;
                }
                window.Instances.getInstance(iname);
            }
            setVfbModel(true);
        }
        dispatch(Actions.addDataToCanvas({
            instancePath: instanceSelected,
            color: COLORS[INSTANCES.indexOf(instanceSelected) + 1]
        }));
    };

    const handleChangeColor = () => {
        if (vfbModelLoaded && instanceVisible()) {
            dispatch(Actions.changeInstanceColor({
                instance: instanceSelected,
                color: COLORS[Math.floor(Math.random() * (COLORS.length - 1))]
            }));
        }
    };

    const instanceVisible = () => {
        for (let singleInstance of exampleState.instances) {
            if (singleInstance.instancePath === instanceSelected) {
                return true;
            }
        }
        return false;
    }

    return (
        <>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                anchor="left"
            >
                <div className={classes.drawerContent}>
                    <ButtonGroup className={classes.buttonGroup} variant="contained" color="primary" aria-label="outlined primary button group" orientation="vertical">
                        <Button color="primary" onClick={onCustomWidgetClick}>Add Widget</Button>
                        <Button color="primary" onClick={() => onRemove('myComponent')}>Remove Widget</Button>
                        <Button color="primary" onClick={() => onMaximize('myComponent')}>Maximize Widget</Button>
                        <Button color="primary" onClick={() => onMinimize('myComponent')}>Minimize Widget</Button>
                        <Button color="primary" onClick={() => onActivate('myComponent')}>Activate Widget</Button>
                        <Button color="primary" onClick={() => onUpdate(MyComponentWidget)}>Update Widget</Button>
                    </ButtonGroup>

                    <ButtonGroup className={classes.buttonGroup} variant="contained" color="secondary" aria-label="outlined primary button group" orientation="vertical">
                        <Button color="secondary" onClick={() => onAddWidgetClick(ImageViewerWidget)}>Add Image Viewer</Button>
                        <Button color="secondary" onClick={() => onRemove('imageViewer')}>Remove Image Viewer</Button>
                    </ButtonGroup>

                    <ButtonGroup className={classes.buttonGroup} variant="contained" color="secondary" aria-label="outlined primary button group" orientation="vertical">
                        <Button color="secondary" onClick={() => onAddWidgetClick(DicomViewerWidget)}>Add DICOM Viewer</Button>
                        <Button color="secondary" onClick={() => onRemove('dicomViewer')}>Remove DICOM Viewer</Button>
                    </ButtonGroup>

                    <ButtonGroup className={classes.buttonGroup} variant="contained" color="secondary" aria-label="outlined primary button group" orientation="vertical">
                        <Button color="secondary" onClick={() => onAddWidgetClick(CanvasWidget)}>Add Canvas</Button>
                        {widgets['canvasWidget'] !== undefined
                            ? <>
                                <FormControl className={classes.buttonGroup}>
                                    <InputLabel id="demo-mutiple-name-label">3D Instance</InputLabel>
                                    <Select
                                        labelId="demo-mutiple-name-label"
                                        id="demo-mutiple-name"
                                        value={instanceSelected}
                                        onChange={handleChange}
                                        input={<Input />}
                                    >
                                        {INSTANCES.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button disabled={instanceSelected === ""} color="secondary" onClick={handleAddInstance}>Add Instance</Button>
                                <Button disabled={instanceSelected === ""} color="secondary" onClick={handleChangeColor}>Change Color</Button>
                            </>
                            : null}
                        <Button color="secondary" onClick={() => onRemove('canvasWidget')}>Remove Canvas</Button>
                    </ButtonGroup>

                    <ButtonGroup className={classes.buttonGroup} variant="contained" color="secondary" aria-label="outlined primary button group" orientation="vertical">
                        <Button onClick={onLoad}>Load</Button>
                        <Button onClick={onChangeLayout}>Change Layout</Button>
                    </ButtonGroup>
                </div>
            </Drawer>
        </>
    );
}


export default LeftSidebar;
