import * as React from 'react';
import * as FlexLayout from '@metacell/geppetto-meta-ui/flex-layout/src/index';
import Actions from '@metacell/geppetto-meta-ui/flex-layout/src/model/Actions';
import DockLocation from '@metacell/geppetto-meta-ui/flex-layout/src/DockLocation';
import Model from '@metacell/geppetto-meta-ui/flex-layout/src/model/Model';
import {type ComponentMap, type IComponentConfig, type Widget, WidgetStatus} from './model';
import WidgetFactory from "./WidgetFactory";
import TabsetIconFactory from "./TabsetIconFactory";
import defaultLayoutConfiguration from "./defaultLayout";
import {getWidget, widget2Node} from "./utils";
import * as GeppettoActions from '../actions';

import {layoutActions, removeWidgetFromStore, setLayout, updateLayout,} from "./actions";

import {MinimizeHelper} from "./helpers/MinimizeHelper";
import {createTabSet, moveWidget} from "./helpers/FlexLayoutHelper";
import type { IJsonModel } from '@metacell/geppetto-meta-ui/flex-layout/src/model/IJsonModel';


const styles = {
  container: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  } as const,
  flexlayout: { flexGrow: 1, position: 'relative' } as const
};

let instance: LayoutManager = null;

/**
 * Wraps the FlexLayout component in order to allow a declarative specification (widgets).
 * of the layout and the components displayed.
 *
 * Handles layout state update and layout import and export.
 *
 * @memberof Control
 */

class LayoutManager {

  model: Model;
  /**
   * Used to restore weights from the default layout
   */
  defaultWeights: {[id: string]: number} = {};
  widgetFactory: WidgetFactory;
  tabsetIconFactory: TabsetIconFactory;
  store;
  layoutManager = this;
  private minimizeHelper: MinimizeHelper;

  /**
   * @constructor
   * @param model
   * @param componentMap
   * @param tabsetIconFactory
   * @param isMinimizeEnabled
   */
  constructor(
    model: IJsonModel,
    componentMap: ComponentMap,
    tabsetIconFactory: TabsetIconFactory = null,
    isMinimizeEnabled = false
  ) {

    this.setLayout(model);
    this.widgetFactory = new WidgetFactory(componentMap);
    this.tabsetIconFactory = tabsetIconFactory
      ? tabsetIconFactory
      : new TabsetIconFactory();
    this.middleware = this.middleware.bind(this);
    this.factory = this.factory.bind(this);
    this.minimizeHelper= new MinimizeHelper(isMinimizeEnabled, this.model)
  }



  setLayout(model: any) {
    this.model = FlexLayout.Model.fromJson(
       model || defaultLayoutConfiguration
    );
    const allNodes: FlexLayout.Node[] = Object.values(this.model._idMap);
    for(const node of allNodes) {
        this.defaultWeights[node.getId()] = node._getAttr("weight");
    }
    this.fixRowRecursive(this.model._root)
  }

  /**
   * Adds a widget to the layout.
   *
   * @param {Widget} widgetConfiguration widget to add
   */
  addWidget(widgetConfiguration: Widget) {
    if (this.getWidget(widgetConfiguration.id) && this.model.getNodeById(widgetConfiguration.id)) {
      return this.updateWidget(widgetConfiguration);
    }
    const { model } = this;
    let tabset = model.getNodeById(widgetConfiguration.panelName);
    if (tabset === undefined) {
        createTabSet(this.model, widgetConfiguration.panelName, widgetConfiguration.defaultPosition, widgetConfiguration.defaultWeight);
    }
    widgetConfiguration.pos = widgetConfiguration.pos ?? tabset.getChildren().length
    this.model.doAction(
      Actions.addNode(
        widget2Node(widgetConfiguration),
        widgetConfiguration.panelName,
        DockLocation.CENTER,
        widgetConfiguration.pos,
        widgetConfiguration.status === WidgetStatus.ACTIVE
      )
    );
  }

  /**
   * Handle rendering of tab set.
   *
   * @param panel
   * @param renderValues
   * @param tabSetButtons
   */
  onRenderTabSet = (panel, renderValues, tabSetButtons) => {
    if (panel.getType() === 'tabset') {
      this.minimizeHelper.addMinimizeButtonToTabset(panel, renderValues);
      if (Array.isArray(tabSetButtons) && tabSetButtons.length > 0) {
        tabSetButtons.forEach(Button => {
          renderValues.stickyButtons.push(
            <Button key={panel.getId()} panel={panel} />
          );
        });
      }
    }
  };



  /**
   * Handle rendering of tab set.
   *
   * @param panel
   * @param renderValues
   * @param tabButtons
   */
  onRenderTab = (panel, renderValues, tabButtons) => {
    if (panel.getType() === 'tab') {
      if (Array.isArray(tabButtons) && tabButtons.length > 0) {
        tabButtons.forEach(Button => {
          renderValues.buttons.push(
            <Button key={panel.getId()} panel={panel} />
          );
        });
      }
    }
  };

  /**
   * Layout wrapper component
   *
   * @memberof Component
   *
   */
  Component = (layoutManager: LayoutManager, config?: IComponentConfig) => ({
    classes,
  }) => (
    <div className="layout-outer-wrapper" style={styles.container}>
      <div className="layout-wrapper" style={styles.flexlayout}>
        <FlexLayout.Layout
          model={this.model}
          factory={this.factory}
          icons={config?.icons}
          // iconFactory={layoutManager.iconFactory.bind(this)}
          onAction={action => layoutManager.onAction(action)}
          onRenderTab={(node, renderValues) =>
            layoutManager.onRenderTab(node, renderValues, config?.tabButtons)
          }
          onRenderTabSet={(node, renderValues) => {
            layoutManager.onRenderTabSet(
              node,
              renderValues,
              config?.tabSetButtons
            );
          }}
        />
      </div>
    </div>
  );

  /**
   * Get the layout component.
   * @memberof Control
   */
  getComponent = (config?: IComponentConfig) => this.Component(this, config);


  /**
   * Export a session.
   */
  exportSession(): { [id: string]: any } {
    const confs = {};
    const components = this.widgetFactory.getComponents();
    for (const wid in components) {
      confs[wid] = components[wid].exportSession();
    }
    return confs;
  }

  /**
   * Import a widget session.
   *
   * @param {string} widgetId id of widget
   * @param conf widget configuration
   */
  importWidgetSession(widgetId: string, conf: any) {
    const component = this.widgetFactory.getComponent(widgetId);
    if (component) {
      try {
        component.importSession(conf);
      } catch (e) {
        console.error('Error importing session for', widgetId, e)
      }
    } else {
      // The component may not be yet initialized when loading the session
      setTimeout(() => this.importWidgetSession(widgetId, conf), 100);
    }
  }

  /**
   * Import complete session.
   *
   * @param confs configuration map
   */
  importSession(confs: { [id: string]: any }): void {
    const imported = new Set();
    for (const wid in confs) {
      this.importWidgetSession(wid, confs[wid]);
      imported.add(wid);
    }

    // Some components may have a current status here but no state exported in the session file
    for (const wid in this.widgetFactory.getComponents()) {
      if (!imported.has(wid)) {
        this.importWidgetSession(wid, null);
      }
    }
  }

  /**
   * Layout manager Redux middleware.
   * Sets the layout from Redux actions.
   *
   * @memberof Control
   * @memberof Control
   */
  middleware = (store) => (next) => (action) => {
    if(!this.store) {
      next(setLayout(JSON.stringify(this.model.toJson())));
    }

    // This is a hack to unlock transitory state in the model before any other action is dispatched. See https://metacell.atlassian.net/browse/GEP-126
    // @ts-ignore
    // On the last version it looks like the n
    // this.model.doAction(Actions.UPDATE_MODEL_ATTRIBUTES, {});

    this.store = store;
    this.widgetFactory.setStore(store)
    this.minimizeHelper.setStore(store);

    let nextAction = true;
    let nextSetLayout = true;

    switch (action.type) {
      case layoutActions.ADD_WIDGET: {
        this.addWidget(action.data);
        break;
      }
      case layoutActions.ADD_WIDGETS: {
        this.addWidgets(action.data);
        break;
      }
      case layoutActions.UPDATE_WIDGET: {

        let updatedWidget = this.updateWidget(action.data);
        action = { ...action, data: updatedWidget };

        break;
      }
      case layoutActions.DESTROY_WIDGET: {
        const widget = action.data;
        this.deleteWidget(widget);
        break;
      }
      case layoutActions.REMOVE_WIDGET: {
        break;
      }
      case layoutActions.ACTIVATE_WIDGET: {
        action.data.status = WidgetStatus.ACTIVE;
        const widget = this.getWidget(action.data.id)
        widget.status = WidgetStatus.ACTIVE;
        this.updateWidget(widget);
        break;
      }

      case layoutActions.SET_WIDGETS: {
        const newWidgets: Map<string, Widget> = action.data;
        for (let widget of this.getWidgets()) {
          if (!newWidgets[widget.id]) {
            this.deleteWidget(widget);
          }
        }
        this.addWidgets(Object.values(newWidgets));
        break;
      }
      case layoutActions.SET_LAYOUT: {
        next(setLayout(action.data));
        return;
      }
      case GeppettoActions.IMPORT_APPLICATION_STATE: {
        const incomingState = action.data.redux.layout;
        this.model = FlexLayout.Model.fromJson(incomingState);
        this.minimizeHelper = new MinimizeHelper(this.minimizeHelper.getIsMinimizeEnabled(), this.model)
        this.importSession(action.data.sessions);
        nextSetLayout = false;
      }
      default: {
        nextSetLayout = false;
      }
    }

    if (nextAction) {
      next(action);
    }
    if (nextSetLayout) {
      this.fixRowRecursive(this.model._root)
      next(updateLayout(this.model));
    }

  };

  restoreWeight(node: FlexLayout.Node) {

    if(node._getAttr("weight") == 0) {
      node._setWeight(this.defaultWeights[node.getId()] ?? 50);
    }

    if(node.getParent()) {
      this.restoreWeight(node.getParent());
    }
  }

  fixRowRecursive(node: FlexLayout.Node) {
    if(node.getType() === "row" || node.getType() === "tabset") {
      if(node.getChildren().length === 0) {
        node._setWeight(0);
        return true;
      } else {


        let empty = true;
        for(let child of node.getChildren()) {
          empty =  this.fixRowRecursive(child) && empty;
        }

        if(!empty) {
          this.restoreWeight(node);
        } else {
          node._setWeight(0);
        }

        return empty;
      }
    }
    return false;

  }

  /**
   * Add a list of widgets.
   *
   * @param {Array<Widget>} newWidgets list of widgets
   * @private
   */
  private addWidgets(newWidgets: Array<Widget>) {
    let actives = [];
    for (let widget of newWidgets) {
      if (widget.status === WidgetStatus.ACTIVE) {
        actives.push(widget.id);
      }
      this.addWidget(widget);
    }

    for (const active of actives) {
      this.model.doAction(FlexLayout.Actions.selectTab(active));
    }
  }

  /**
   * Delete a widget.
   *
   * @param widget
   * @private
   */
  private deleteWidget(widget: any) {
    this.model.doAction(Actions.deleteTab(widget.id));
  }

  /**
   * Return widgets.
   *
   * @private
   */
  private getWidgets(): Widget[] {
    return Object.values(this.store.getState().widgets)
  }

  /**
   * Get specific widget.
   *
   * @param id
   * @private
   */
  private getWidget(id): Widget {
    return getWidget(this.store, id)
  }

  /**
   * Handles state update related to actions in the flex layout
   * (e.g. select or move tab)
   *
   * @memberof Control
   * @param action
   */
  onAction(action) {
    const oldModel = this.model.toJson();
    let defaultAction = true;
    switch (action.type) {
      case Actions.SET_ACTIVE_TABSET:
        break;
      case Actions.SELECT_TAB:
        const widget = this.getWidget(action.data.tabNode);
        if (widget && widget.status === WidgetStatus.MINIMIZED) {
          this.minimizeHelper.restoreWidget(widget);
        }

        break;
      case Actions.DELETE_TAB: {
        if (this.getWidget(action.data.node).hideOnClose) {
          // widget only minimized, won't be removed from layout nor widgets list
          this.minimizeHelper.minimizeWidget(action.data.node);
          defaultAction = false;
        } else {
          // remove widget from widgets list
          this.store.dispatch(removeWidgetFromStore(action.data.node))
        }
        break;
      }
      case Actions.MAXIMIZE_TOGGLE:
	// reminder, widgets are not maximised but tabsets are
        break;
      case Actions.RENAME_TAB:
        break;
      case Actions.ADJUST_SPLIT:
        break;
      case Actions.ADD_NODE: {
        break;
      }
      case Actions.MOVE_NODE: {
        break;
      }
      default: {
        this.model.doAction(action);
      }
    }
    if (defaultAction) {
      this.model.doAction(action);
    }
    this.fixRowRecursive(this.model._root)

    const newModel = this.model.toJson();
    if (oldModel !== newModel) {

      this.store.dispatch(updateLayout(this.model));
    }
    return undefined
  }

  /**
   * Update a widget.
   *
   * @param widget
   * @private
   */
  private updateWidget(widget: Widget) {
    const { model } = this;
    const previousWidget = this.getWidget(widget.id);
    const mergedWidget = { ...previousWidget, ...widget }

    const widgetRestored = this.minimizeHelper.restoreWidgetIfNecessary(previousWidget, mergedWidget);
    if(!widgetRestored){
      moveWidget(model, mergedWidget);
    }

    this.widgetFactory.updateWidget(mergedWidget);

    const node = this.model.getNodeById(widget.id);


    if (node) {
      model.doAction(Actions.updateNodeAttributes(mergedWidget.id, widget2Node(mergedWidget)));
      if (mergedWidget.status === WidgetStatus.ACTIVE) {
        model.doAction(FlexLayout.Actions.selectTab(mergedWidget.id));
      }
      if((widget.status === WidgetStatus.MAXIMIZED && !node.getParent().isMaximized()) ||
          (widget.status === WidgetStatus.ACTIVE && node.getParent().isMaximized())) {
        this.model.doAction(FlexLayout.Actions.maximizeToggle(node.getParent().getId()));
      }
      else if(widget.status === WidgetStatus.MINIMIZED && !this.minimizeHelper.isMinimized(widget)) {
        this.minimizeHelper.minimizeWidget(node.getId());
      }
    }

    return mergedWidget
  }

  /**
   * Create widget for node.
   *
   * @param node
   */
  factory(node) {
    return this.widgetFactory.factory(node.getConfig());
  }

  /**
   * Create icon for node.
   *
   * @param node
   */
  iconFactory(node) {
    // TODO move to newest flexlayout-react to add this functionality when needed
    return this.tabsetIconFactory.factory(node.getConfig());
  }


}

export function initLayoutManager(model, componentMap: ComponentMap, iconFactory: TabsetIconFactory, isMinimizeEnabled: boolean) {
  instance = new LayoutManager(model, componentMap, iconFactory, isMinimizeEnabled);
  return instance;
}

export const getLayoutManagerInstance = () => instance;
