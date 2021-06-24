import React from 'react';
import './App.css';
// import './flexlayout.css';
import MainLayout from './app/showcase';
import CssBaseline from '@material-ui/core/CssBaseline';
import { _ } from 'core-js';
import { Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { activateWidget, addWidget, destroyWidget, maximizeWidget, minimizeWidget, setLayout, updateWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import { LoadingSpinner } from '@metacell/geppetto-meta-client/components/index';
import Grid from '@material-ui/core/Grid';
import { ButtonGroup } from '@material-ui/core';
import { MyComponentWidget, ImageViewerWidget, DicomViewerWidget } from 'widgets';
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

const App = () => {

  const dispatch = useDispatch();

  // Click callbacks
  const onCustomWidgetClick = () => dispatch(addWidget(MyComponentWidget));
  const onAddWidgetClick = (widget) => dispatch(addWidget(widget));
  const onRemove = (id) => dispatch(destroyWidget(id));
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

  const onLoad = () => {
    dispatch({ type: Actions.DATA_LOADING_START })
    
    setTimeout(() => {
      dispatch({ type: Actions.DATA_LOADING_END })
    }, 4000);
  }

  return (
    <div className="App">
      <CssBaseline />
      <Grid container spacing={5} >
        <Grid container item xs={12} spacing={2}>
          <ButtonGroup color="primary" aria-label="outlined primary button group">
            <Button color="primary" onClick={onCustomWidgetClick}>Add Widget</Button>
            <Button color="primary" onClick={() => onRemove('myComponent')}>Remove Widget</Button>
            <Button color="primary" onClick={() => onMaximize('myComponent')}>Maximize Widget</Button>
            <Button color="primary" onClick={() => onMinimize('myComponent')}>Minimize Widget</Button>
            <Button color="primary" onClick={() => onActivate('myComponent')}>Activate Widget</Button>
            <Button color="primary" onClick={() => onUpdate(MyComponentWidget)}>Update Widget</Button>
          </ButtonGroup>

          <ButtonGroup color="secondary" aria-label="outlined primary button group">
            <Button color="secondary" onClick={() => onAddWidgetClick(ImageViewerWidget)}>Add Big Image Viewer</Button>
            <Button color="secondary" onClick={() => onRemove('imageViewer')}>Remove Big Image Viewer</Button>
          </ButtonGroup>

          <ButtonGroup color="secondary" aria-label="outlined primary button group">
            <Button color="secondary" onClick={() => onAddWidgetClick(DicomViewerWidget)}>Add DICOM Viewer</Button>
            <Button color="secondary" onClick={() => onRemove('dicomViewer')}>Remove DICOM Viewer</Button>
          </ButtonGroup>

          <Button color="secondary" onClick={onLoad}>Load</Button>
          <Button color="secondary" onClick={onChangeLayout}>Change Layout</Button>
        </Grid>

        <Grid container item xs={12} spacing={1}>
          <MainLayout />
        </Grid>
      </Grid>
      <LoadingSpinner />
    </div>
  );
}

export default App;
