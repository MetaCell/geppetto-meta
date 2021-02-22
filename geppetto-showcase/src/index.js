import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'font-awesome/scss/font-awesome.scss';
import '../geppetto-client/geppetto-client/style/css/gpt-icons.css';
import '../geppetto-client/geppetto-ui/src/flex-layout/showcase/styles/flexlayout.less';

const rootElement = document.getElementById('container');
ReactDOM.render(<App />, rootElement);
