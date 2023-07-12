import * as redux from "redux";
import { callbacksMiddleware } from './middleware/geppettoMiddleware';

import { initLayoutManager } from './layout/LayoutManager';
import EventManager from './EventManager';
import { layoutInitialState, LayoutState, layout, widgets } from './reducer/geppettoLayout';
import geppettoClientReducer, { clientInitialState, ClientState } from './reducer/geppettoClient';
import { WidgetMap, ComponentMap } from "./layout/model";
import TabsetIconFactory from "./layout/TabsetIconFactory";
import { reducerDecorator } from "./reducer/reducerDecorator"
import { GeppettoAction } from "../common/actions";

declare var window: any;

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


export function createStore (
  reducers: redux.ReducersMapObject,
  state: any,
  enhancers: redux.Middleware[],
  layout: {iconFactory?: TabsetIconFactory, baseLayout?: LayoutState, componentMap: ComponentMap, isMinimizeEnabled?: boolean}={componentMap: {}}): redux.Store<any, GeppettoAction> {

  const layoutManager = initLayoutManager(layout.baseLayout || layoutInitialState, layout.componentMap, layout.iconFactory, layout.isMinimizeEnabled || false);
  const allMiddlewares = [...enhancers, callbacksMiddleware, layoutManager.middleware];

  const store = redux.createStore(
    reducerDecorator(redux.combineReducers({...staticReducers, ...reducers})),
    {...initialState, ...state },
    storeEnhancers(redux.applyMiddleware(...allMiddlewares))
  );
  EventManager.setStore(store);

  return store;
}

export default createStore;
