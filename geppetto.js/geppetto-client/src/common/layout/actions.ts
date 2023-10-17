import { WidgetStatus, Widget, WidgetMap } from './model';
import * as FlexLayout from '@metacell/geppetto-meta-ui/flex-layout/src/index';

export const layoutActions = {
  SET_LAYOUT: 'SET_LAYOUT',
  SET_WIDGETS: 'SET_WIDGETS',
  UPDATE_WIDGET: 'UPDATE_WIDGET',
  ACTIVATE_WIDGET: 'ACTIVATE_WIDGET',
  ADD_WIDGET: 'ADD_WIDGET',
  ADD_WIDGETS: 'ADD_WIDGETS',
  RESET_LAYOUT: 'RESET_LAYOUT',
  DESTROY_WIDGET: 'DESTROY_WIDGET',
  REMOVE_WIDGET: 'REMOVE_WIDGET',
  UPDATE_LAYOUT: 'UPDATE_LAYOUT',
};

export const newWidget = ({ path, component, panelName, ...others }) => ({
  type: layoutActions.ADD_WIDGET,
  data: {
    id: path,
    instancePath: path,
    component: component,
    name: path,
    status: WidgetStatus.ACTIVE,
    panelName: panelName,
    ...others
  }
});


export const addWidget = (widget: Widget) => ({
  type: layoutActions.ADD_WIDGET,
  data: widget
});

export const addWidgets = (widgets: WidgetMap) => ({
  type: layoutActions.ADD_WIDGETS,
  data: widgets
});

export const setWidgets = (widgets: WidgetMap) => ({
  type: layoutActions.SET_WIDGETS,
  data: widgets
});

export const updateWidget = (newConf: Widget) => ({
  type: layoutActions.UPDATE_WIDGET,
  data: newConf
})

/**
 * Support action: do not consider as part of the api
 * @param id 
 */
export const setLayout = ((newLayout: string) => ({
  type: layoutActions.SET_LAYOUT,
  data: newLayout
}))

export const updateLayout = ((layout: FlexLayout.Model) => ({
  type: layoutActions.UPDATE_LAYOUT,
  data: layout 
}));

export const minimizeWidget = id => ({
  type: layoutActions.UPDATE_WIDGET,
  data: {
    id,
    status: WidgetStatus.MINIMIZED
  }
});

export const maximizeWidget = id => ({
  type: layoutActions.UPDATE_WIDGET,
  data: {
    id,
    status: WidgetStatus.MAXIMIZED
  }
});

export const activateWidget = id => ({
  type: layoutActions.ACTIVATE_WIDGET,
  data: { id }
});

export const deleteWidget = id => ({
  type: layoutActions.DESTROY_WIDGET,
  data: { id }
});


export const destroyWidget = deleteWidget;

/**
 * Support action: do not consider as part of the api
 * @param id 
 */
export const removeWidgetFromStore = id => ({
  type: layoutActions.REMOVE_WIDGET,
  data: { id }
});

export const resetLayout = { type: layoutActions.RESET_LAYOUT, };
