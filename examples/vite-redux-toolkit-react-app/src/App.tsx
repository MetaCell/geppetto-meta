import HomePage from "./pages/HomePage";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from "./components/MainLayout.tsx";
import '@metacell/geppetto-meta-client/common/layout/styles/light.css'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <MainLayout>
        <HomePage />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
