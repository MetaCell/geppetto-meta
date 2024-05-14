import componentMap from '../app/componentMap';
import { exampleMiddleware } from './middleware'
import { layout as baseLayout } from '../app/layout';
import { createStore } from '@metacell/geppetto-meta-client/common';
import exampleReducer from './reducer';

const INIT_STATE = {
  "exampleState": {
    instances: []
  }
};

const reducers = {
  "exampleState": exampleReducer
};

/**
 * The createStore function is used to initialize the redux store & configure the layout.
 *
 * You can build upon geppetto-meta's configuration by passing your own reducers, initial state and middlewares.
 */
const store = createStore(
  reducers,
  INIT_STATE,
  [exampleMiddleware],
  { baseLayout, componentMap, isMinimizeEnabled: true }
)

export default store;

