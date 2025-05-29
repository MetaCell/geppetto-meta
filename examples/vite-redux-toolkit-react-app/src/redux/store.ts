import type { WidgetMap } from "@metacell/geppetto-meta-client/common/layout/model";
import  { clientInitialState, type ClientState } from "@metacell/geppetto-meta-client/common/reducer/geppettoClient";
import { type LayoutState, layoutInitialState } from "@metacell/geppetto-meta-client/common/reducer/geppettoLayout";
import { createLayoutAndStore } from '@metacell/geppetto-meta-client/common';
import  { InstancesState, initialState as initialInstancesState  } from './slices/instanceSlice.ts';

import baseLayout from '../layoutManager/defaultLayout'
import componentMap from "../layoutManager/componentsMap.tsx";

export interface RootState {
  client: ClientState;
  layout: LayoutState;
  widgets: WidgetMap;
  instances: InstancesState
}

const initialState = {
  client: clientInitialState,
  layout: layoutInitialState,
  widgets: {},
  instances: initialInstancesState,
};

function configureStore() {
  const middlewares: never[] = [];
  const reducers = {};
  const isMinimizeEnabled = true;
  const { store } = createLayoutAndStore(
    reducers,
    initialState,
    middlewares,
    // @ts-expect-error The two objects misses some fields to be type-coherent with the signature, but those fields are not really required
    { baseLayout, componentMap, isMinimizeEnabled },
  );
  return store;
}

const store = configureStore()

export default store;