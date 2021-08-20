import { createStore } from '@metacell/geppetto-meta-client/common';
import { layout as baseLayout } from '../app/layout';
import { exampleMiddleware } from './middleware'
import componentMap from '../app/componentMap';
import * as Actions from '../redux/actions';
//import { createStore } from 'redux'
import { combineReducers } from '@reduxjs/toolkit';

const INIT_FILE_SELECTOR_STATE = {
  visible : false
};

const INIT_STATE = {
  FileSelector: INIT_FILE_SELECTOR_STATE
}

function FileSelectorReducer (state = INIT_FILE_SELECTOR_STATE, action) {
  switch(action.type){
    case Actions.FILE_SELECTOR_TOGGLE:      
      return Object.assign({}, state, { visible: !state.visible });  
    default:
      return state;
  }
}

/**
 * The createStore function is used to initialize the redux store & configure the layout.  
 * 
 * You can build upon geppetto-meta's configuration by passing your own reducers, initial state and middlewares.
 */
const store = createStore(
  { FileSelector: FileSelectorReducer },
  INIT_STATE,
  [exampleMiddleware],
  { baseLayout, componentMap }
)
//const store = createStore(rootReducer)

export default store;

