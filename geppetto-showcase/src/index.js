import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '@metacell/geppetto-meta-client/style/css/gpt-icons.css';
import './examples/flex-layout/flexlayout.less';
import "core-js/stable";
import "regenerator-runtime/runtime";

const rootElement = document.getElementById('container');
ReactDOM.render(<App />, rootElement);
