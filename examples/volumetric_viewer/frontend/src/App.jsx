import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import Resources from '@metacell/geppetto-meta-core/Resources';
import './App.css'

const instance1spec = {
  "eClass": "SimpleInstance",
  "id": "ANeuron",
  "name": "The first SimpleInstance to be render with Geppetto Canvas",
  "type": { "eClass": "SimpleType" },
  "visualValue": {
    "eClass": Resources.OBJ,
    'gltf': null
  }
}

function loadInstances (){
  ModelFactory.cleanModel();
  const instance1 = new SimpleInstance(instance1spec)
  window.Instances = [instance1]
  augmentInstancesArray(window.Instances);
}

function App() {
  const [count, setCount] = useState(0)

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
      	<input type="text" placeholder="file url"/>
        <button onClick={() => console.log("conversion!")}>
          Convert
        </button>
        <input type="file"/>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
