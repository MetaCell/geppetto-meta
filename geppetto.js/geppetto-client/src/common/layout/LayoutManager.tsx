import * as React from "react";
import * as FlexLayout from "flexlayout-react";
import { Actions, DockLocation, Model, IJsonModel } from "flexlayout-react";
import {
  BaseNode,
  type ComponentMap,
  type IComponentConfig,
  type Widget,
  WidgetStatus,
} from "./model";
import WidgetFactory from "./WidgetFactory";
import TabsetIconFactory from "./TabsetIconFactory";
import defaultLayoutConfiguration from "./defaultLayout";
import { getWidget, widget2Node } from "./utils";
import * as GeppettoActions from "../actions";

import {
  layoutActions,
  removeWidgetFromStore,
  setLayout,
  updateLayout,
} from "./actions";

import { MinimizeHelper } from "./helpers/MinimizeHelper";
import { createTabSet, moveWidget } from "./helpers/FlexLayoutHelper";

const styles = {
  container: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
  } as const,
  flexlayout: { flexGrow: 1, position: "relative" } as const,
};

const DEFAULT_SPLITER_SIZE = 8;

let instance: LayoutManager = null;

/**
 * Wraps the FlexLayout component in order to allow a declarative specification (widgets).
 * of the layout and the components displayed.
 *
 * Handles layout state update and layout import and export.
 *
 * @memberof Control
 */

export class LayoutManager {
  model: Model;
  /**
   * Used to restore weights from the default layout
   */
  defaultWeights: { [id: string]: number } = {};
  widgetFactory: WidgetFactory;
  tabsetIconFactory: TabsetIconFactory;
  store;
  layoutManager = this;
  private minimizeHelper: MinimizeHelper;
  layout;
  private layoutWrapper;
  private defaultSplitterSize;

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
    this.minimizeHelper = new MinimizeHelper(isMinimizeEnabled, this.model);
    this.defaultSplitterSize = DEFAULT_SPLITER_SIZE;
    this.layout = React.createRef();
    this.layoutWrapper = React.createRef();
  }

  setLayout(model: any) {
    this.model = FlexLayout.Model.fromJson(model || defaultLayoutConfiguration);
    this.model.visitNodes((node) => {
      const fn = (node as BaseNode)?.getWeight;
      if (!fn) {
        return;
      }
      this.defaultWeights[node.getId()] = fn.bind(node)();
    });
    this.fixRowRecursive(this.model.getRoot());
  }

  /**
   * Adds a widget to the layout.
   *
   * @param {Widget} widgetConfiguration widget to add
   */
  addWidget(widgetConfiguration: Widget) {
    if (
      this.getWidget(widgetConfiguration.id) &&
      this.model.getNodeById(widgetConfiguration.id)
    ) {
      return this.updateWidget(widgetConfiguration);
    }
    const { model } = this;
    let tabset = model.getNodeById(widgetConfiguration.panelName);
    if (tabset === undefined) {
      tabset = createTabSet(
        this.model,
        widgetConfiguration.panelName,
        widgetConfiguration.defaultPosition,
        widgetConfiguration.defaultWeight
      );
    }
    widgetConfiguration.pos =
      widgetConfiguration.pos ?? tabset.getChildren().length;
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
    if (this.layoutWrapper.current) {
      this.layoutWrapper.current.style.visibility = "hidden";
    }
    if (panel.getType() === "tabset") {
      this.minimizeHelper.addMinimizeButtonToTabset(panel, renderValues);
      if (Array.isArray(tabSetButtons) && tabSetButtons.length > 0) {
        tabSetButtons.forEach((Button) => {
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
    if (this.layoutWrapper.current) {
      this.layoutWrapper.current.style.visibility = "";
    }
    if (panel.getType() === "tab") {
      if (Array.isArray(tabButtons) && tabButtons.length > 0) {
        tabButtons.forEach((Button) => {
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
  Component =
    (layoutManager: LayoutManager, config?: IComponentConfig) => (props) => {
      return (
        <div className="layout-outer-wrapper" style={styles.container}>
          <div
            className="layout-wrapper"
            ref={this.layoutWrapper}
            style={styles.flexlayout}
          >
            <FlexLayout.Layout
              ref={this.layout}
              model={this.model}
              factory={this.factory}
              icons={config?.icons}
              // iconFactory={layoutManager.iconFactory.bind(this)}
              onAction={(action) => layoutManager.onAction(action)}
              onRenderTab={(node, renderValues) => {
                return layoutManager.onRenderTab(
                  node,
                  renderValues,
                  config?.tabButtons
                );
              }}
              onRenderTabSet={(node, renderValues) => {
                return layoutManager.onRenderTabSet(
                  node,
                  renderValues,
                  config?.tabSetButtons
                );
              }}
            />
          </div>
        </div>
      );
    };

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
        console.error("Error importing session for", widgetId, e);
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
    if (!this.store) {
      next(setLayout(this.model));
    }

    // This is a hack to unlock transitory state in the model before any other action is dispatched. See https://metacell.atlassian.net/browse/GEP-126
    // @ts-ignore
    // On the last version it looks like the n
    // this.model.doAction(Actions.UPDATE_MODEL_ATTRIBUTES, {});

    this.store = store;
    this.widgetFactory.setStore(store);
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
        const updatedWidget = this.updateWidget(action.data);
        action = { ...action, data: updatedWidget };
        this.layout?.current?.redraw();
        break;
      }
      case layoutActions.DESTROY_WIDGET: {
        const widget = action.data;
        this.deleteWidget(widget);
        break;
      }
      case layoutActions.REMOVE_WIDGET: {
        const widget = action.data;
        this.widgetFactory.deleteWidget(widget.id);
        break;
      }
      case layoutActions.ACTIVATE_WIDGET: {
        action.data.status = WidgetStatus.ACTIVE;
        const widget = this.getWidget(action.data.id);
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
        this.minimizeHelper = new MinimizeHelper(
          this.minimizeHelper.getIsMinimizeEnabled(),
          this.model
        );
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
      this.fixRowRecursive(this.model.getRoot());
      next(updateLayout(this.model));
    }
  };

  setTabsetWeight(node: FlexLayout.Node, weight: number) {
    this.model.doAction(
      FlexLayout.Actions.updateNodeAttributes(node.getId(), { weight })
    );
  }

  restoreWeight(node: FlexLayout.Node) {
    const baseNode = node as BaseNode;
    if (baseNode?.getWeight?.() === 0) {
      this.setTabsetWeight(
        baseNode,
        this.defaultWeights[baseNode.getId()] ?? 50
      );
    }

    if (baseNode.getParent()) {
      this.restoreWeight(baseNode.getParent());
    }
  }

  containsWidget(node: FlexLayout.Node) {
    if (
      node.getChildren().length === 0 ||
      !node.getChildren().every((n) => n.getType() === "tab")
    ) {
      return false;
    }
    for (const child of node.getChildren()) {
      if (this.containsWidget(child)) {
        return true;
      }
    }
    return false;
  }

  childrenByTabset() {
    let childrenCount = 0;
    this.model.visitNodes((node) => {
      childrenCount += node.getChildren().some((n) => n.getType() === "tab")
        ? 1
        : 0;
    });
    return childrenCount;
  }

  fixRowRecursive(node: FlexLayout.Node) {
    if (node.getType() === "row" || node.getType() === "tabset") {
      if (node.getChildren().length === 0) {
        this.setTabsetWeight(node, 0);
        return true;
      } else {
        let empty = true;
        const children = node.getChildren();
        for (const child of children) {
          empty = this.fixRowRecursive(child) && empty;
        }
        if (this.model.getRoot() === node) {
          if (this.childrenByTabset() <= 1) {
            this.model.doAction(
              FlexLayout.Actions.updateModelAttributes({ splitterSize: 0 })
            );
          } else {
            this.model.doAction(
              FlexLayout.Actions.updateModelAttributes({
                splitterSize: this.defaultSplitterSize,
              })
            );
          }
        }
        if (!empty) {
          this.restoreWeight(node);
        } else {
          this.setTabsetWeight(node, 0);
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
    this.widgetFactory.deleteWidget(widget.id);
  }

  /**
   * Return widgets.
   *
   * @private
   */
  private getWidgets(): Widget[] {
    return Object.values(this.store.getState().widgets);
  }

  /**
   * Get specific widget.
   *
   * @param id
   * @private
   */
  private getWidget(id): Widget {
    return getWidget(this.store, id);
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
        if (this.getWidget(action.data.node)?.hideOnClose) {
          // widget only minimized, won't be removed from layout nor widgets list
          this.minimizeHelper.minimizeWidget(action.data.node);
          defaultAction = false;
        } else {
          // remove widget from widgets list
          this.store.dispatch(removeWidgetFromStore(action.data.node));
        }
        break;
      }
      case Actions.MAXIMIZE_TOGGLE:
        // reminder, widgets are not maximised but tabsets are
        break;
      case Actions.RENAME_TAB:
        break;
      // case Actions.ADJUST_SPLIT:
      //   break;
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
    this.fixRowRecursive(this.model.getRoot());

    const newModel = this.model.toJson();
    if (oldModel !== newModel) {
      this.store.dispatch(updateLayout(this.model));
    }
    return undefined;
  }

  private shouldMoveWidget(previous, current) {
    return (
      previous.pos !== current.pos ||
      previous.panelName !== current.panelName ||
      current.status !== previous.status
    );
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
    const mergedWidget = { ...previousWidget, ...widget };

    const widgetRestored = this.minimizeHelper.restoreWidgetIfNecessary(
      previousWidget,
      mergedWidget
    );
    if (!widgetRestored && this.shouldMoveWidget) {
      moveWidget(model, mergedWidget);
    }

    this.widgetFactory.updateWidget(mergedWidget);

    const node = this.model.getNodeById(widget.id);

    if (node) {
      model.doAction(
        Actions.updateNodeAttributes(mergedWidget.id, widget2Node(mergedWidget))
      );
      if (mergedWidget.status === WidgetStatus.ACTIVE) {
        model.doAction(FlexLayout.Actions.selectTab(mergedWidget.id));
      }
      const parent = node.getParent() as BaseNode;
      if (
        (widget.status === WidgetStatus.MAXIMIZED && !parent.isMaximized()) ||
        (widget.status === WidgetStatus.ACTIVE && parent.isMaximized())
      ) {
        this.model.doAction(
          FlexLayout.Actions.maximizeToggle(node.getParent().getId())
        );
      } else if (
        widget.status === WidgetStatus.MINIMIZED &&
        !this.minimizeHelper.isMinimized(widget)
      ) {
        this.minimizeHelper.minimizeWidget(node.getId());
      }
    }

    return mergedWidget;
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

// Global registry for layout manager
export const layoutManagerRegistry = new WeakMap<object, LayoutManager>();
export function initLayoutManager(
  model,
  componentMap: ComponentMap,
  iconFactory: TabsetIconFactory,
  isMinimizeEnabled: boolean
) {
  const instance = new LayoutManager(
    model,
    componentMap,
    iconFactory,
    isMinimizeEnabled
  );
  return instance;
}

export const registerStoreLayout = (store, layoutManager) => {
  layoutManagerRegistry.set(store, layoutManager);
};

export const useLayoutManager = (store: object) => {
  const Component = React.useMemo(() => {
    return layoutManagerRegistry.get(store)?.getComponent();
  }, [store]);

  return Component ? Component : null;
};
