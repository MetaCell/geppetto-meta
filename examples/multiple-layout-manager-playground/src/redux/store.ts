import { createStore } from '@metacell/geppetto-meta-client/common';
import baseLayout from '../layout/defaultLayout';
import componentMap from '../layout/componentsMap';

function configureStore() {
  const middlewares: never[] = [];
  const reducers = {};
  const INIT_STATE = {};
  const isMinimizeEnabled = true;
  return createStore(
    reducers,
    INIT_STATE,
    middlewares,
    { baseLayout, componentMap, isMinimizeEnabled },
  );
}

const store = configureStore()
export default store;