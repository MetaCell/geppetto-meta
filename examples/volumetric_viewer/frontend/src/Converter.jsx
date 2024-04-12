import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import Resources from '@metacell/geppetto-meta-core/Resources';
import DefaultApi from './rest/src/api/DefaultApi.js';
import './App.css'

function Converter() {
  var DefApi = new DefaultApi();
  var nrrd;
  var file_url;
  var uuid = "undefined";
  const reader = new FileReader();
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
      <h1>Volumetric viewer web app</h1>
      <h2>Generated file is : {uuid}</h2>
      <div className="Instructions">
        <p>
          Enter nrrd or nifti file URL then click on convert to get an obj file, enter the given file name in the field below to load the OBJ into  viewer.
        </p>
      </div>
      <div className="card">
      	<input type="text" placeholder="file url" onChange={(evt) => { file_url = evt.target.value;}}/>
        <button onClick={() => uuid = DefApi.generateVolume(null)}>
          Convert
        </button>
      </div>
      <div className="getter">
        <input type="text" placeholder="uuid" onChange={(evt) => { nrrd = evt.target.files[0];}}/>
        <button onClick={() => console.log('load obj')}>
        	Load OBJ
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default Converter
