import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import HomePage from "./pages/HomePage";
import { useState } from 'react';
import { Workspace } from './workspace';
import MainLayout from './components/MainLayout';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const defaultWorkspace = new Workspace('default-workspace', 'Default Workspace', () => {});
  const [workspaces] = useState<Record<string, Workspace>>({
    [defaultWorkspace.id]: defaultWorkspace,
  });
  const [selectedWorkspaceId] = useState<string>(defaultWorkspace.id);
  
  const renderWorkspace = () => {
    if (!selectedWorkspaceId || !workspaces[selectedWorkspaceId]) return null;
    
    return (
      <Provider store={workspaces[selectedWorkspaceId].store}>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </Provider>
    );
  };
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
        {renderWorkspace()}
    </ThemeProvider>
  );
}

export default App;
