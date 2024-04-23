import { useState } from 'react';
import React from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate} from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import DefaultApi from './rest/src/api/DefaultApi.js';
import Viewer from "./Viewer";
import Converter from "./Converter";
import './App.css';
import { useStore, Provider} from 'react-redux';
import ReactDOM from 'react-dom';

function App() {
  //const store = useStore();
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

/*ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);*/

