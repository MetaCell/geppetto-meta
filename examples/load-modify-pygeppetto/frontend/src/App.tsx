import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AnyCommand, CommandsService, ModelService } from './rest'
import { applyModification } from './commands'

function App() {
  const [model, setModel] = useState(null)
  const [commands, setCommands] = useState<Record<string, AnyCommand>>({})

  const loadModel = async () => {
    const loadedModel = await ModelService.loadModel("instances")
    setModel(loadedModel)
  }

  const createDummyCommand = async (model: any) => {
    const updated = await applyModification(model, (draft: any) => {
      const variable = draft.variables[0]
      variable.name = variable.name + 'Bar'
      variable.id = "PP" + variable.id
    })
    setModel(updated)
    setCommands(await CommandsService.listCommands("instances"))
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => loadModel()}>
          load model
        </button>
        <button onClick={() => createDummyCommand(model)}>
          change variable name
        </button>
        {Object.entries(commands).map(([k, c]) =>
          <li key={k}>{`${k}: ${JSON.stringify(c)}`}</li>
        )}
        <p>
          {JSON.stringify(model)}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
