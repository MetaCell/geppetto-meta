import React from 'react';
import './App.css';
import './flexlayout.css';
import FlexLayoutShowcase from './app/showcase';
import CssBaseline from '@material-ui/core/CssBaseline';
import { _ } from 'core-js';
import { Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { addWidget, destroyWidget } from '@metacell/geppetto-meta-client/common/layout/actions';
import Grid from '@material-ui/core/Grid';
import { ButtonGroup } from '@material-ui/core';

const App = () => {

  const dispatch = useDispatch();

  const onCustomWidgetClick = () => {
    dispatch(
      addWidget({
        id: 'myComponent',
        name: "My Component",
        component: "myComponent",
        panelName: "rightPanel",
        enableClose: false,
      })
    );
  };

  const onImageViewerClick = () => {
    dispatch(
      addWidget({
        id: 'imageViewer',
        component: "imageViewer",
        panelName: "leftPanel",
        enableClose: false,
      })
    );
  };

  const onRemove = (id) => {
    dispatch(destroyWidget(id));
  }

  const onLoad = () => {
    dispatch({
      type: "LOADING_START"
    })

    setTimeout(() => {
      dispatch({
        type: 'LOADING_END'
      })
    }, 4000);
  }

  return (
    <div className="App">
      <CssBaseline />
      <Grid container spacing={5} >
        <Grid container item xs={12} spacing={1}>

          <ButtonGroup color="primary" aria-label="outlined primary button group">
            <Button color="primary" onClick={onCustomWidgetClick}>Add Widget</Button>
            <Button color="primary" onClick={() => onRemove('myComponent')}>Remove Widget</Button>
          </ButtonGroup>

          <Button color="primary" onClick={onImageViewerClick}>Add Big Image Viewer</Button>

          <Button color="primary" onClick={onLoad}>Load</Button>
        </Grid>

        <Grid container item xs={12} spacing={1}>
          <FlexLayoutShowcase />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
