import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AnyCommand, CommandsService, ModelService, Set, type Compound } from './rest'
import { add, compound, remove, set } from './commands'
import { applyPatches, Patch, produceWithPatches } from 'immer'


const resolve = (path: string[], model: Record<string, any>) => {
  let obj = model;
  for (const sub of path.slice(0, -1)) {
    obj = obj[sub]
  }
  return [obj.uuid, ...path.slice(-1)]
}




function App() {
  const [model, setModel] = useState(null)
  const [commands, setCommands] = useState<Record<string, AnyCommand>>({})

  const loadModel = async () => {
    const loadedModel = await ModelService.loadModel("instances")
    setModel(loadedModel)
  }

  const createDummyCommand = async (model: any) => {
    const [_updated, patch, _inversePath] = produceWithPatches(model, (draft: any) => {
      draft.variables[0].name = draft.variables[0].name + 'Bar'
      draft.variables.push({element: "new"})
      draft.variables[1].name = 'FOO'
    });

    console.log("Patch", patch)

    // Translate the command
    const commands = []
    for (const p of patch) {
      if (p.op == "replace") {
        const [ownerUUID, feature] = resolve(p.path, model)
        const cmd: Set = set({ owner: {
          uuid: ownerUUID
        },
        feature: feature,
        value: p.value
        })
        commands.push(cmd)
      }
      console.log("P", p)
    }
    if (commands.length === 0) {
      console.log("No modification")
      return
    }
    const command = commands.length > 1 ? compound(commands) : commands[0]
    const notifications = await CommandsService.executeCommand("instances", command)

    // Translate the command back to a immer patch
    const patches = []
    for (const notif of notifications) {
      if (notif.kind === 'set') {
        patches.push({
          op: 'replace',
          path: [...notif.notifier.path?.replace(/[/@]/g, '').split('.'), notif.feature],
          value: notif.new
        } as Patch)
      }
    }

    const updated = applyPatches(model, patches)
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
          <li>{`${k}: ${JSON.stringify(c)}`}</li>
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
