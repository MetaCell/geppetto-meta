import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue, orange } from '@material-ui/core/colors';

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

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
      <App />
      </MuiThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
