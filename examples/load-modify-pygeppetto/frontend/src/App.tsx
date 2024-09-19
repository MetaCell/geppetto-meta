import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CommandsService, ModelService, Set, type Compound } from './rest'
import { add, compound, remove, set } from './commands'
import { produceWithPatches } from 'immer'


const resolve = (path: string[], model: Record<string, any>) => {
  let obj = model;
  for (const sub of path.slice(0, -1)) {
    obj = obj[sub]
  }
  return [obj.uuid, ...path.slice(-1)]
}

const createDummyCommand = async (model) => {
  const [updated, patch, inversePath] = produceWithPatches(model, draft => {
    draft.variables[0].name = 'FOO'
  });

  // Translate the command
  for (const p of patch) {
    if (p.op == "replace") {
      const [ownerUUID, feature] = resolve(p.path, model)
      const cmd: Set = set({ owner: {
        uuid: ownerUUID
      },
      feature: feature,
      value: p.value
      })
      CommandsService.executeCommand("instances", cmd)
    }
  }
  console.log(model)
  console.log(updated)
  console.log(patch)
  // const cmd: Compound = compound(
  //   [add({
  //     owner: { uuid: 'ABC' },
  //     feature: "featu",
  //     value: 44
  //   }), remove({
  //     owner: { uuid: 'ABC' },
  //     feature: "featu",
  //     value: 44
  //   })])

  // CommandsService.executeCommand(cmd)
}


function App() {
  const [model, setModel] = useState(null)

  const loadModel = async () => {
    const loadedModel = await ModelService.loadModel("instances")
    setModel(loadedModel)
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
