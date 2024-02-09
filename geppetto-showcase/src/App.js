import React, { Component } from 'react';
import {
  createMuiTheme,
  responsiveFontSizes,
  MuiThemeProvider,
} from '@mui/material/styles';
import { blue, orange } from '@mui/material/colors';
import Main from './components/Main';
import CssBaseline from '@mui/material/CssBaseline';
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
        button: { main: '#fc6320' },
        toolbarBackground: { main: 'rgb(0,0,0,0.5)' },
      },
      overrides: {
        MuiListItemIcon: {
          root: {
            '& i.my-svg-icon': {
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7.32911 13.2291L3.85411 9.75414L2.67078 10.9291L7.32911 15.5875L17.3291 5.58748L16.1541 4.41248L7.32911 13.2291Z' fill='%23D6D5D7'/%3E%3C/svg%3E");`,
              display: 'inline-block',
              width: '16px',
              height: '12px',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat'
            }
          }
        }
      }
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
