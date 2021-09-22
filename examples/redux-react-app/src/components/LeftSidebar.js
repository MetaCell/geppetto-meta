import React from 'react';
import { Button, ButtonGroup, Drawer } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { activateWidget, addWidget, deleteWidget, maximizeWidget, minimizeWidget, setLayout, updateWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { makeStyles } from '@material-ui/core/styles';
import { MyComponentWidget, ImageViewerWidget, DicomViewerWidget, CanvasWidget } from 'widgets';
import { layout } from 'app/layout';
import * as Actions from 'redux/actions';

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