import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import HomePage from "./pages/HomePage";
import { useState } from 'react';
import { Workspace } from './workspace';

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
    // Create a new workspace using the activeDatasets record
    const newWorkspace = new Workspace(id, name, updateWorkspace);
    setWorkspaces((prev) => ({ ...prev, [id]: newWorkspace }));
  };

  const handleCreateClick = () => {
    const workspaceId = `workspace-${Date.now()}`;
    const workspaceName = `Workspace ${Object.keys(workspaces).length + 1}`;

    createWorkspace(workspaceId, workspaceName);
    setSelectedWorkspacesIds(new Set<string>([workspaceId]));
  };

  console.log("workspaces: ", workspaces)

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          {/* <Provider store={store}>
            <HomePage/>
          </Provider>
          <Provider store={anotherStore}>
            <HomePage/>
          </Provider> */}
          <button onClick={handleCreateClick}>Create workspace</button>
          {Array.from(selectedWorkspacesIds)?.map((id: any) => (
            <Provider key={id} store={workspaces[id].store}>
              <HomePage/>
            </Provider>
          ))}
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
