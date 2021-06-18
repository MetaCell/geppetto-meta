import { createStore } from '@metacell/geppetto-meta-client/common';
import { layout as baseLayout } from '../app/layout';
import { exampleMiddleware } from './middleware'
import componentMap from '../app/componentMap';

const reducers = {};

const INIT_STATE = {
};

const store = createStore(
  reducers,
  INIT_STATE,
  [exampleMiddleware],
  { baseLayout, componentMap }
)

export default store;

