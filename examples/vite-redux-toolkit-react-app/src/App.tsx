import HomePage from "./pages/HomePage";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from "./components/MainLayout.tsx";
import '@metacell/geppetto-meta-ui/flex-layout/style/light.scss'

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MainLayout>
        <HomePage/>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
