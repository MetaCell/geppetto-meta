import {Box, CssBaseline } from '@mui/material';
import HomePage from './pages/HomePage';
import MainLayout from "./components/MainLayout.tsx";
const App = () => {
  return (
    <Box className="App">
      <CssBaseline />
      <MainLayout>
        <HomePage />
      </MainLayout>
    </Box>
  );
};

export default App;
