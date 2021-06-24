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
  projectPersisted,
  projectConfigLoaded,
  instanceDeleted,
  instancesCreated,
  // TODO: why are these imports unused?
  showTutorial,
  hideTutorial,
  startTutorial,
  stopTutorial,
  showQueryBuilder,
  hideQueryBuilder,
  showSpinner,
  hideSpinner,
  showHelp,
  hideHelp,
  canvasInitialised,
  projectMadePublic,
  controlPanelOpen,
  controlPanelClose,
  litEntitiesChanged,
  componentDestroyed,
  parametersSet,
  commandLog,
  commandLogDebug,
  commandLogRun,
  commandClear,
  commandToggleImplicit,
  receivePythonMessage,
  errorWhileExecPythonCommand,
  websocketDisconnected,
  updateCamera,
  stopLogo,
  spinLogo,
  geppettoInfo,
  geppettoError,
  stopPersist,
  spinPersist,
  jupyterGeppettoExtensionReady,
  disableControls,
  GeppettoAction,
} from './actions';

export const callbacksList: { [id: string]: Set<Function> } = {}

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
    [clientActions.PROJECT_PERSISTED]: () => (
      this.store.dispatch(projectPersisted())
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
    [clientActions.COMMAND_LOG]: message => (
      this.store.dispatch(commandLog(message))
    ),
    [clientActions.COMMAND_LOG_DEBUG]: message => (
      this.store.dispatch(commandLogDebug(message))
    ),
    [clientActions.COMMAND_LOG_RUN]: message => (
      this.store.dispatch(commandLogRun(message))
    ),
    [clientActions.COMMAND_CLEAR]: () => (
      this.store.dispatch(commandClear())
    ),
    [clientActions.COMMAND_TOGGLE_IMPLICIT]: () => (
      this.store.dispatch(commandToggleImplicit())
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
    [clientActions.UPDATE_CAMERA]: () => (
      this.store.dispatch(updateCamera())
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

  projectLoaded() {
    this.actionsHandler[clientActions.PROJECT_LOADED]()
  }

  projectDownloaded() {
    this.actionsHandler[clientActions.PROJECT_DOWNLOADED]()
  }

  projectConfigLoaded(configuration) {
    this.actionsHandler[clientActions.PROJECT_CONFIG_LOADED](configuration)
  }

  projectPersisted() {
    this.actionsHandler[clientActions.PROJECT_PERSISTED]()
  }

  instanceDeleted(instancePath) {
    this.actionsHandler[clientActions.INSTANCE_DELETED](instancePath)
  }

  instancesCreated(instances) {
    this.actionsHandler[clientActions.INSTANCES_CREATED](instances)
  }

  showTutorial() {
    this.actionsHandler[clientActions.SHOW_TUTORIAL]()
  }

  hideTutorial() {
    this.actionsHandler[clientActions.HIDE_TUTORIAL]()
  }

  startTutorial() {
    this.actionsHandler[clientActions.START_TUTORIAL]()
  }

  stopTutorial() {
    this.actionsHandler[clientActions.STOP_TUTORIAL]()
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

  canvasInitialised() {
    this.actionsHandler[clientActions.CANVAS_INITIALISED]()
  }

  projectMadePublic() {
    this.actionsHandler[clientActions.PROJECT_MADE_PUBLIC]()
  }

  openControlPanel() {
    this.actionsHandler[clientActions.CONTROL_PANEL_OPEN]()
  }

  closeControlPanel() {
    this.actionsHandler[clientActions.CONTROL_PANEL_CLOSE]()
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

  commandLog(message) {
    this.actionsHandler[clientActions.COMMAND_LOG](message)
  }

  commandLogDebug(message) {
    this.actionsHandler[clientActions.COMMAND_LOG_DEBUG](message)
  }

  commandLogRun(message) {
    this.actionsHandler[clientActions.COMMAND_LOG_RUN](message)
  }

  commandClear() {
    this.actionsHandler[clientActions.COMMAND_CLEAR]()
  }

  commandToggleImplicit() {
    this.actionsHandler[clientActions.COMMAND_TOGGLE_IMPLICIT]()
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

  updateCamera() {
    this.actionsHandler[clientActions.UPDATE_CAMERA]()
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
}

export default new EventManager();
