import { createTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';

const theme = createTheme({
  typography: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' },
  palette: {
    type: 'dark',
    primary: {
      main: orange[700]
    },

    // Big Image Viewer depends on these custom property
    button: { main: '#fc6320' },
    toolbarBackground: { main: 'rgb(0,0,0,0.5)' },

  },
  drawer: {
    width: '240px'
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        '.MuiBox-content': {
          display: 'flex',
          alignItems: 'flex-start',
          flex: 1,
          minHeight: '100vh',
          padding: '3.75rem 1.0rem 1.0rem',
        },
      },
    },
    MuiAppBar: {
      root: {
        zIndex: 1300,
        boxShadow: 'none',
      },
    },
  }
});

export default theme;