import { initLayoutManager } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import type { WidgetMap } from "@metacell/geppetto-meta-client/common/layout/model";
import { callbacksMiddleware } from "@metacell/geppetto-meta-client/common/middleware/geppettoMiddleware";
import geppettoClientReducer, { clientInitialState, type ClientState } from "@metacell/geppetto-meta-client/common/reducer/geppettoClient";
import { type LayoutState, layout, layoutInitialState, widgets } from "@metacell/geppetto-meta-client/common/reducer/geppettoLayout";
import { reducerDecorator } from "@metacell/geppetto-meta-client/common/reducer/reducerDecorator";
import { type Action, type Reducer, combineReducers, configureStore } from "@reduxjs/toolkit";
import instancesReducer, { InstancesState, initialState as initialInstancesState  } from './slices/instanceSlice.ts';

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

const rootReducer: Reducer<RootState> = reducerDecorator(
  combineReducers<RootState>({
    client: geppettoClientReducer,
    layout,
    widgets,
    instances: instancesReducer
  }),
);

const getLayoutManagerAndStore = () => {
  const layoutManager = initLayoutManager(baseLayout, componentMap, undefined, false);
  const middlewareEnhancer = (getDefaultMiddleware) => getDefaultMiddleware().concat(callbacksMiddleware, layoutManager.middleware);
  
  const storeOptions: {
    preloadedState: Partial<RootState>;
    reducer: (state: RootState | undefined, action: Action) => RootState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: (getDefaultMiddleware: ReturnType<ReturnType<any>>) => any;
  } = {
    reducer: rootReducer,
    middleware: middlewareEnhancer,
    preloadedState: { ...initialState } as Partial<RootState>,
  };
  
  const store = configureStore(storeOptions);
  
  return {
    layoutManager,
    store,
  };
};

const { store } = getLayoutManagerAndStore();

export default store;