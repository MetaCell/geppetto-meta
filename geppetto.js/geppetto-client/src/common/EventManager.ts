/**
 * Geppetto redux store manager
 *
 * Dario Del Piano
 */
import { Store } from 'redux';
import { clientActions } from './actions/actions';
import {
  selectInstance,
  visibilityChanged,
  focusChanged,
  modelLoaded,
  projectLoading,
  projectLoaded,
  projectDownloaded,
  projectConfigLoaded,
  instanceDeleted,
  instancesCreated,
  showSpinner,
  hideSpinner,
  parametersSet,
  loadProjectFromId,
  loadProjectFromUrl,
  receivePythonMessage,
  errorWhileExecPythonCommand,
  websocketDisconnected,
  stopLogo,
  spinLogo,
  geppettoInfo,
  geppettoError,
  stopPersist,
  spinPersist,
  jupyterGeppettoExtensionReady,
  disableControls,
  GeppettoAction,
  addWidget,
  addWidgets,
  deleteWidget as deleteWidget,
  updateWidget,
  setWidgets,
  minimizeWidget,
  maximizeWidget,
  activateWidget
} from './actions';
import { Widget, WidgetMap } from './layout/model';

interface Callbacks { [id: string]: Set<Function> }
export const callbacksList: Callbacks = {};

for (const action in clientActions) {
  callbacksList[action] = new Set<Function>()
}

/**
 * Workaround to enable the use of EventManager without requiring a redux store.
 * 
 * EventManager is used across geppetto-core, but not every application has a redux store.
 */
interface MockStore {
  dispatch: Function
}

/**
 * @deprecated
 */
class EventManager {

  store: Store<any, GeppettoAction> | MockStore;
  initialized: boolean = false;

  constructor() {
    this.store = {
      dispatch: (_: any) => { }
    }
  }

  setStore(store: Store<any, GeppettoAction>) {
    if (this.initialized) {
      throw Error("Cannot set the store more than once")
    }
    this.store = store;
    this.initialized = true;
  }

  clientActions = clientActions;
  eventsCallback = callbacksList;

  action(action, params) {
    this.store.dispatch({ type: action, data: { ...params } });
  }

  actionsHandler: { [id: string]: Function } = {
    [clientActions.SELECT]: (scope, geometryIdentifier, point) => (
      this.store.dispatch(selectInstance(scope, geometryIdentifier, point))
    ),
    [clientActions.VISIBILITY_CHANGED]: instance => (
      this.store.dispatch(visibilityChanged(instance))
    ),
    [clientActions.FOCUS_CHANGED]: instance => (
      this.store.dispatch(focusChanged(instance))
    ),
    [clientActions.MODEL_LOADED]: () => (
      this.store.dispatch(modelLoaded())
    ),
    [clientActions.PROJECT_LOADING]: () => (
      this.store.dispatch(projectLoading())
    ),
    [clientActions.PROJECT_LOADED]: () => (
      this.store.dispatch(projectLoaded())
    ),
    [clientActions.PROJECT_DOWNLOADED]: () => (
      this.store.dispatch(projectDownloaded())
    ),
    [clientActions.PROJECT_CONFIG_LOADED]: configuration => (
      this.store.dispatch(projectConfigLoaded(configuration))
    ),
    [clientActions.INSTANCE_DELETED]: instancePath => (
      this.store.dispatch(instanceDeleted(instancePath))
    ),
    [clientActions.INSTANCES_CREATED]: instances => (
      this.store.dispatch(instancesCreated(instances))
    ),
    [clientActions.PARAMETERS_SET]: () => (
      this.store.dispatch(parametersSet())
    ),
    [clientActions.RECEIVE_PYTHON_MESSAGE]: data => (
      this.store.dispatch(receivePythonMessage(data))
    ),
    [clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND]: data => (
      this.store.dispatch(errorWhileExecPythonCommand(data))
    ),
    [clientActions.WEBSOCKET_DISCONNECTED]: () => (
      this.store.dispatch(websocketDisconnected())
    ),
    [clientActions.STOP_LOGO]: () => (
      this.store.dispatch(stopLogo())
    ),
    [clientActions.SPIN_LOGO]: () => (
      this.store.dispatch(spinLogo())
    ),
    [clientActions.GEPPETTO_ERROR]: message => (
      this.store.dispatch(geppettoError(message))
    ),
    [clientActions.GEPPETTO_INFO]: message => (
      this.store.dispatch(geppettoInfo(message))
    ),
    [clientActions.STOP_PERSIST]: () => (
      this.store.dispatch(stopPersist())
    ),
    [clientActions.SPIN_PERSIST]: () => (
      this.store.dispatch(spinPersist())
    ),
    [clientActions.JUPYTER_GEPPETTO_EXTENSION_READY]: () => (
      this.store.dispatch(jupyterGeppettoExtensionReady())
    ),
    [clientActions.DISABLE_CONTROLS]: () => (
      this.store.dispatch(disableControls())
    ),
    [clientActions.SHOW_SPINNER]: (message) => {
      this.store.dispatch(showSpinner(message))
    },
    [clientActions.HIDE_SPINNER]: () => {
      this.store.dispatch(hideSpinner())
    },
    [clientActions.PROJECT_LOAD_FROM_ID]: projectId => (
      this.store.dispatch(loadProjectFromId(projectId))
    ),
    [clientActions.PROJECT_LOAD_FROM_URL]: projectUrl => (
      this.store.dispatch(loadProjectFromUrl(projectUrl))
    ),

  };

  select(scope, geometryIdentifier, point) {
    this.actionsHandler[clientActions.SELECT](scope, geometryIdentifier, point)
  }

  changeVisibility(instance) {
    this.actionsHandler[clientActions.VISIBILITY_CHANGED](instance)
  }

  changeFocus(instance) {
    this.actionsHandler[clientActions.FOCUS_CHANGED](instance)
  }

  modelLoaded() {
    this.actionsHandler[clientActions.MODEL_LOADED]()
  }

  loadProjectFromId(projectId) {
    this.actionsHandler[clientActions.PROJECT_LOAD_FROM_ID](projectId)
  }

  loadProjectFromUrl(projectUrl) {
    this.actionsHandler[clientActions.PROJECT_LOAD_FROM_URL](projectUrl)
  }

  projectLoaded() {
    this.actionsHandler[clientActions.PROJECT_LOADED]()
  }

  projectDownloaded() {
    this.actionsHandler[clientActions.PROJECT_DOWNLOADED]()
  }

  projectConfigLoaded(configuration) {
    this.actionsHandler[clientActions.PROJECT_CONFIG_LOADED](configuration)
  }

  instanceDeleted(instancePath) {
    this.actionsHandler[clientActions.INSTANCE_DELETED](instancePath)
  }

  instancesCreated(instances) {
    this.actionsHandler[clientActions.INSTANCES_CREATED](instances)
  }

  showQueryBuilder() {
    this.actionsHandler[clientActions.SHOW_QUERYBUILDER]()
  }

  hideQueryBuilder() {
    this.actionsHandler[clientActions.HIDE_QUERYBUILDER]()
  }

  showSpinner(message) {
    this.actionsHandler[clientActions.SHOW_SPINNER](message)
  }

  showHelp() {
    this.actionsHandler[clientActions.SHOW_HELP]()
  }

  hideHelp() {
    this.actionsHandler[clientActions.HIDE_HELP]()
  }

  setColor(parameters) {
    this.actionsHandler[clientActions.COLOR_SET](parameters)
  }

  projectMadePublic() {
    this.actionsHandler[clientActions.PROJECT_MADE_PUBLIC]()
  }

  litEntitiesChanged() {
    this.actionsHandler[clientActions.LIT_ENTITIES_CHANGED]()
  }

  componentDestroyed() {
    this.actionsHandler[clientActions.COMPONENT_DESTROYED]()
  }

  projectPropertiesSaved() {
    this.actionsHandler[clientActions.PROJECT_PROPERTIES_SAVED]()
  }

  parametersSet() {
    this.actionsHandler[clientActions.PARAMETERS_SET]()
  }

  receivePythonMessage(data) {
    this.actionsHandler[clientActions.RECEIVE_PYTHON_MESSAGE](data)
  }

  errorWhileExecPythonCommand(data) {
    this.actionsHandler[clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND](data)
  }

  websocketDisconnected() {
    this.actionsHandler[clientActions.WEBSOCKET_DISCONNECTED]()
  }

  stopLogo() {
    this.actionsHandler[clientActions.STOP_LOGO]()
  }

  spinLogo() {
    this.actionsHandler[clientActions.SPIN_LOGO]()
  }

  geppettoError(message) {
    this.actionsHandler[clientActions.GEPPETTO_ERROR](message)
  }

  geppettoInfo(message) {
    this.actionsHandler[clientActions.GEPPETTO_INFO](message)
  }

  stopPersist() {
    this.actionsHandler[clientActions.STOP_PERSIST]()
  }

  spinPersist() {
    this.actionsHandler[clientActions.SPIN_PERSIST]()
  }

  jupyterGeppettoExtensionReady() {
    this.actionsHandler[clientActions.JUPYTER_GEPPETTO_EXTENSION_READY]()
  }

  disableControls() {
    this.actionsHandler[clientActions.DISABLE_CONTROLS]()
  }

  /**
   * Add a widget to the layout
   * @param widget 
   */
  addWidget(widget: Widget) {
    this.store.dispatch(addWidget(widget))
  }

  /**
   * Update a widget
   * @param widget 
   */
  updateWidget(widget: Widget) {
    this.store.dispatch(updateWidget(widget))
  }

  /**
   * Adds all the widgets to the layout
   * @param widget 
   */
  addWidgets(widget: WidgetMap) {
    this.store.dispatch(addWidgets(widget))
  }
  
  /**
   * Set/replaces widgets to the layout
   * @param widget 
   */
  setWidgets(widget: WidgetMap) {
    this.store.dispatch(setWidgets(widget))
  }

  /**
   * Removes a widget from the layout
   * @param widget 
   */
  deleteWidget(widgetId: string) {
    this.store.dispatch(deleteWidget(widgetId))
  }
  
   /**
   * Set widget to minimized status (sugar for update widget)
   * @param widget 
   */
  minimizeWidget(widgetId: string) {
    this.store.dispatch(minimizeWidget(widgetId))
  }

   /**
   * Set widget to maximize status (sugar for update widget)
   * @param widget 
   */
  maximizeWidget(widgetId: string) {
    this.store.dispatch(maximizeWidget(widgetId))
  }
  

  /**
   * Set widget to active status (sugar for update widget)
   * @param widget 
   */
  activateWidget(widgetId: string) {
    this.store.dispatch(activateWidget(widgetId))
  }
  
  
}

export default new EventManager();
