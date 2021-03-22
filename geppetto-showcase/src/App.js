import React, { Component } from 'react';
import {
  createMuiTheme,
  responsiveFontSizes,
  MuiThemeProvider,
} from '@material-ui/core/styles';
import { blue, orange } from '@material-ui/core/colors';
import Main from './components/Main';
import CssBaseline from '@material-ui/core/CssBaseline';

const GEPPETTO = {};
window.GEPPETTO = GEPPETTO;
GEPPETTO.Resources = require('@geppettoengine/geppetto-core/Resources').default;
require('@geppettoengine/geppetto-client/pages/geppetto/GEPPETTO.Events').default(
  GEPPETTO
);
const Manager = require('@geppettoengine/geppetto-client/common/Manager')
  .default;
const ModelFactory = require('@geppettoengine/geppetto-core/ModelFactory').default(
  GEPPETTO
);

GEPPETTO.Utility = {};
GEPPETTO.Utility.extractMethodsFromObject = () => [];
GEPPETTO.trigger = (evt) => console.log(evt, 'triggered');
GEPPETTO.Manager = new Manager();
console.warn = () => null;
GEPPETTO.CommandController = {
  log: console.log,
  createTags: (a, b) => null,
};
GEPPETTO.ComponentFactory = {
  addExistingComponent: console.log,
};
GEPPETTO.on = console.log;
GEPPETTO.off = console.log;
GEPPETTO.UnitsController = {
  getUnitLabel: function (unit) {
    return unit;
  },
  hasUnit: function (unit) {
    return true;
  },
};

export default class App extends Component {
  render() {
    let theme = createMuiTheme({
      typography: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' },
      palette: {
        type: 'dark',
        primary: { main: orange[500] },
        secondary: { main: blue[500] },
        button: { main: '#fc6320' },
        toolbarBackground: { main: 'rgb(0,0,0,0.5)' },
      },
    });
    theme = responsiveFontSizes(theme);

    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Main />
      </MuiThemeProvider>
    );
  }
}