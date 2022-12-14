import React from 'react';
import './App.css';
import MainLayout from './app/showcase';
import CssBaseline from '@material-ui/core/CssBaseline';
import { _ } from 'core-js';
import { AppBar, Toolbar, IconButton, Box } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import LeftSidebar from './components/LeftSidebar';
import { LoadingSpinner } from '@metacell/geppetto-meta-client/components/index';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import './styles/cameraControls.css';
// Three different FlexLayout styles
// import '@metacell/geppetto-meta-ui/flex-layout/style/gray.scss'
import '@metacell/geppetto-meta-ui/flex-layout/style/dark.scss';
import DraggableSidebar from './components/dnd/DraggableSidebar';
// import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss'
// import '@metacell/geppetto-meta-client/style/less/main.less'

// TODO: fix css, flexlayout.css causes icons to not show up
// import './styles/flexlayout.css';

const App = () => {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <CssBaseline />
        <AppBar position="fixed">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box display="flex">
          <DraggableSidebar />
          <LeftSidebar />
          <Box className="MuiBox-content">
            <MainLayout />
            <LoadingSpinner />
          </Box>
        </Box>
      </DndProvider>
    </div>
  );
};

export default App;
