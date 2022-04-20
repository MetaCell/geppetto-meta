import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'font-awesome/scss/font-awesome.scss';
import '@metacell/geppetto-meta-client/style/css/gpt-icons.css';
// import '@metacell/geppetto-meta-ui/flex-layout/showcase/styles/flexlayout.less';
import './examples/flex-layout/flexlayout.less';
import "core-js/stable";
import "regenerator-runtime/runtime";

const rootElement = document.getElementById('container');
ReactDOM.render(<App />, rootElement);
