import React from 'react';
import './App.css';
import './flexlayout.css';
import MainLayout from './app/showcase';
import CssBaseline from '@material-ui/core/CssBaseline';
import { _ } from 'core-js';
import { AppBar, Toolbar, IconButton, Box } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import LeftSidebar from './components/LeftSidebar';
import { LoadingSpinner } from '@metacell/geppetto-meta-client/components/index';


const App = () => {

  return (
    <div className="App">
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box display="flex" >
        <LeftSidebar />
        <Box className="MuiBox-content">
          <MainLayout />
          <LoadingSpinner />
        </Box>
      </Box>
    </div >
  );
}

export default App;
