import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DefaultApi from './rest/src/api/DefaultApi.js';
import Viewer from "./Viewer";
import Converter from "./Converter";
import './App.css'

function App() {
  var DefApi = new DefaultApi();
  var nrrd;
  var file_url;
  var uuid = "undefined";
  const reader = new FileReader();
  return (
    <>
      <Router>
      	<Routes>
      		<Route path="/Viewer" element={<Viewer />} />
      		<Route path="/" element={<Converter />} />
      	</Routes>
      </Router>
    </>
  )
}

export default App
