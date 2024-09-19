import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import HomePage from "./pages/HomePage";
import { useState } from 'react';
import { Workspace } from './workspace';
import { Box } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>({});
  const [selectedWorkspacesIds, setSelectedWorkspacesIds] = useState<Set<string>>(new Set<string>());

  const updateWorkspace = (workspace: Workspace) => {
    setWorkspaces((prev) => ({
      ...prev,
      [workspace.id]: workspace,
    }));
  };

  const createWorkspace = (id: string, name: string) => {
    const newWorkspace = new Workspace(id, name, updateWorkspace);
    setWorkspaces((prev) => ({ ...prev, [id]: newWorkspace }));
  };

  const handleCreateClick = () => {
    const workspaceId = `workspace-${Date.now()}`;
    const workspaceName = `Workspace ${Object.keys(workspaces).length + 1}`;

    createWorkspace(workspaceId, workspaceName);
    setSelectedWorkspacesIds(prevSelectedIds => {
      const updatedSet = new Set(prevSelectedIds);
      updatedSet.add(workspaceId); // Add the new workspace ID
      return updatedSet;
    });  
  };

  const renderCompareMode = (workspaceIds: string[]) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto auto" }}>
      {workspaceIds.map((id) => (
        <Provider key={id} store={workspaces[id].store}>
          <HomePage />
        </Provider>
      ))}
    </Box>
  );

  const renderWorkspaces = () => {
    return renderCompareMode(Array.from(selectedWorkspacesIds));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          <button onClick={handleCreateClick} style={{ margin: "10px" }}>Create workspace</button>
          {renderWorkspaces()}
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
