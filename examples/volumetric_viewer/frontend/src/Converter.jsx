import { useState } from 'react'
import {useNavigate} from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import Resources from '@metacell/geppetto-meta-core/Resources';
import DefaultApi from './rest/src/api/DefaultApi.js';
import './App.css'

	
function Converter() {
  const reader = new FileReader();
  const DefApi = new DefaultApi();
  const navigate = useNavigate();
  let nrrd;
  let file_url;
  let uuid = "undefined";
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

        <input type="file" placeholder="file url" onChange={
          (evt) => {
            file_url = evt.target.files[0];
        }}/>
        <button onClick={() => uuid = DefApi.generateVolume({'file': file_url})}>
          Convert
        </button>
      </div>
      <div className="getter">
        <input type="text" placeholder="uuid" onChange={(evt) => { nrrd = evt.target.files[0];}}/>
        <button onClick={() => sendFileToViewer(null, navigate)}>
        	Load OBJ
        </button>
      </div>
    </>
  )
}

function sendFileToViewer(file_to_send, navigate){
	console.log("load obj");
	navigate("/Viewer");	
}

export default Converter
