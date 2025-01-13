import * as redux from "redux";
import { callbacksMiddleware } from './middleware/geppettoMiddleware';

import { initLayoutManager, LayoutManager } from './layout/LayoutManager';
import EventManager from './EventManager';
import { layoutInitialState, type LayoutState, layout, widgets } from './reducer/geppettoLayout';
import geppettoClientReducer, { clientInitialState, type ClientState } from './reducer/geppettoClient';
import type { WidgetMap, ComponentMap } from "./layout/model";
import type TabsetIconFactory from "./layout/TabsetIconFactory";
import { reducerDecorator } from "./reducer/reducerDecorator"
import type { GeppettoAction } from "../common/actions";

declare let window: any;

interface GeppettoState{
  client: ClientState,
  layout: LayoutState,
  widgets: WidgetMap
}

const initialState: GeppettoState = {
  client: clientInitialState,
  layout: layoutInitialState,
  widgets: {}
};

const staticReducers = {
  client: geppettoClientReducer,
  layout,
  widgets
}

// Use the below for redux debugging with stack trace
//const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({trace: true, traceLimit: 25}) || redux.compose;
const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;

export function createStore(
  reducers: redux.ReducersMapObject,
  state: any,
  enhancers: redux.Middleware[],
  layout: {
    iconFactory?: TabsetIconFactory;
    baseLayout?: LayoutState;
    componentMap: ComponentMap;
    isMinimizeEnabled?: boolean;
  } = { componentMap: {} }
): { layoutManager: LayoutManager; store: redux.Store<any, GeppettoAction> } {
  // Initialize layout manager with provided layout settings
  const layoutManager = initLayoutManager(
    layout.baseLayout || layoutInitialState,
    layout.componentMap,
    layout.iconFactory,
    layout.isMinimizeEnabled || false
  );

  // Compose all middleware including layout manager middleware
  const allMiddlewares = [...enhancers, callbacksMiddleware, layoutManager.middleware];

  // Create a Redux store with composed middleware
  const store = redux.createStore(
    reducerDecorator(redux.combineReducers({ ...staticReducers, ...reducers })),
    { ...initialState, ...state },
    storeEnhancers(redux.applyMiddleware(...allMiddlewares))
  );

  // Set the store in the EventManager for global access
  EventManager.setStore(store);

  return { layoutManager, store };
}


export default createStore;
