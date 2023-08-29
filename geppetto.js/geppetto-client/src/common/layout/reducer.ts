import * as FlexLayout from '@metacell/geppetto-meta-ui/flex-layout/src/index';
import { layoutActions } from './actions';
import * as General from '../actions';
import { WidgetStatus, WidgetMap, ExtendedNode } from './model'
import layoutInitialState from './defaultLayout';
export { layoutInitialState };

export interface LayoutState {
  global: {
    sideBorders: number,
    tabSetHeaderHeight: number,
    tabSetTabStripHeight: number,
    enableEdgeDock: Boolean,
    borderBarSize: number
  },
  borders: {
    type: string,
    location: string,
    children: ExtendedNode[]
  }[],
  layout: {
    type: string,
    weight: number,
    id: string,
    children: ExtendedNode[]
  }
}

/**
 * Layout state update handling.
 * Logic comes from the layout manager.
 * 
 * @alias layoutReducer
 * @memberof Control
 */
export const layout = (state = layoutInitialState, action) => {

  switch (action.type) {

  case layoutActions.SET_LAYOUT: {
    return { ...state, ...action.data.toJson() }
  }

  case General.IMPORT_APPLICATION_STATE: {
    const incomingState = action.data.redux.layout;
    return incomingState;
  }
  default:
    return state
  }
}

/**
 * Ensure there is one only active widget in the same panel
 * @param {*} widgets 
 * @param {*} param1 
 */
function updateWidgetStatus (widgets: WidgetMap, { status, panelName }) {
  if (status != WidgetStatus.ACTIVE) {
    return widgets;
  }
  return Object.fromEntries(Object.values(widgets).filter(widget => widget).map(widget => [
    widget.id,
    {
      ...widget,
      status: widget.panelName == panelName ? WidgetStatus.HIDDEN : widget.status
    }
  ]));
}

function removeUndefined (obj) {
  return Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : '');
}

function extractPanelName (action) {
  return action.data.component == "Plot" ? "bottomPanel" : "leftPanel";
}

export const widgets = (state: WidgetMap = {}, action) => {

  if (action.data) {
    removeUndefined(action.data); // Prevent deletion in case of unpolished update action
  }

  switch (action.type) {

  case layoutActions.ADD_WIDGET:
  case layoutActions.ACTIVATE_WIDGET:
  case layoutActions.UPDATE_WIDGET: {
    const newWidget = { ...state[action.data.id], panelName: extractPanelName(action), ...action.data };
    return {
      ...updateWidgetStatus(state, newWidget),
      [action.data.id]: newWidget
    }
  }
  case layoutActions.SET_WIDGETS: {
    return { ...action.data }
  }
  case layoutActions.ADD_WIDGETS: {
    return { ...state, ...action.data }
  }

  case layoutActions.REMOVE_WIDGET:
  case layoutActions.DESTROY_WIDGET: {
    const newWidgets = { ...state };
    delete newWidgets[action.data.id];
    return newWidgets;
  }
  case layoutActions.SET_LAYOUT: {
    const model: FlexLayout.Model = action.data;
    const newWidgets = { ...state };
    for (const widgetId in newWidgets) {
      const node = model.getNodeById(widgetId);
      if (node) {
        newWidgets[widgetId] = { ...widgets[widgetId], ...node.getConfig() };
      }
      
    }
    return newWidgets
  }
  default:
    return state;
  }
}

