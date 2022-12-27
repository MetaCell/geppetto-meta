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

GEPPETTO.trigger = evt => console.log(evt, 'triggered');

console.warn = () => null;

export default class App extends Component {
  render () {
    let theme = createMuiTheme({
      typography: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' },
      palette: {
        type: 'dark',
        primary: { main: orange[500] },
        secondary: { main: blue[500] },
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
