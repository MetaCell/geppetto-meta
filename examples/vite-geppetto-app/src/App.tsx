import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";

/*
 * Import a FlexLayout theme.  The new @metacell/geppetto package ships
 * thin wrapper CSS files for each flexlayout-react theme under
 * layout/styles/.  Switch to dark.css / rounded.css etc. as needed.
 */
import "@metacell/geppetto/layout/styles/light.css";

const lightTheme = createTheme({
  palette: { mode: "light" },
  typography: { fontFamily: '"Inter", system-ui, sans-serif' },
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
