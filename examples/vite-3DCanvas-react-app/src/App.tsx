import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Canvas3DExample from "./components/viewers/Canvas3DExample";

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          position: "relative",
          width: "100vw",
          height: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <Canvas3DExample />
      </Box>
    </ThemeProvider>
  );
}

export default App;
