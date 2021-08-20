import { createStore } from '@metacell/geppetto-meta-client/common';
import { layout as baseLayout } from '../app/layout';
import { exampleMiddleware } from './middleware'
import componentMap from '../app/componentMap';
import * as Actions from '../redux/actions';

const INIT_STATE = {
  FileSelectorState: {
    visible : false
  }
};

function FileSelectorReducer (state = INIT_STATE.FileSelectorState, action) {
  switch(action.type){
    case Actions.FILE_SELECTOR_TOGGLE:      
      return Object.assign(state, { visible: !state.visible });
    default:
      return state;
  }
}
const reducers = [FileSelectorReducer];


/**
 * The createStore function is used to initialize the redux store & configure the layout.  
 * 
 * You can build upon geppetto-meta's configuration by passing your own reducers, initial state and middlewares.
 */
const store = createStore(
  reducers,
  INIT_STATE,
  [exampleMiddleware],
  { baseLayout, componentMap }
)

export default store;

