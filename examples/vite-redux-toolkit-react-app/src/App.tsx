import HomePage from "./pages/HomePage";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from "./components/MainLayout.tsx";

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
