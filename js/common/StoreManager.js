/**
 * Geppetto redux store manager
 *
 * Dario Del Piano
 */

const newStore = require('./store/store').default;
const { clientActions } = require('./actions/actions');
const { callbacksList } = require('./middleware/geppettoMiddleware');
const {
  selectInstance,
  visibilityChanged,
  focusChanged,
  modelLoaded,
  projectLoading,
  projectLoaded,
  projectDownloaded,
  projectPersisted,
  experimentOver,
  experimentLoaded,
  experimentPlay,
  experimentStatusCheck,
  experimentPause,
  experimentResume,
  experimentRunning,
  experimentStop,
  experimentCompleted,
  experimentFailed,
  experimentUpdate,
  experimentUpdated,
  experimentRenamed,
  experimentDeleted,
  experimentActive,
  experimentCreated,
  spotlightClosed,
  spotlightLoaded,
  instanceDeleted,
  instancesCreated,
  showTutorial,
  hideTutorial,
  showSpinner,
  hideSpinner,
  colorSet,
  canvasInitialised,
  projectMadePublic,
  controlPanelOpen,
  controlPanelClose,
  litEntitiesChanged,
  componentDestroyed,
  experimentPropertiesSaved,
  projectPropertiesSaved,
  parametersSet,
  commandLog,
  commandLogDebug,
  commandLogRun,
  commandClear,
  commandToggleImplicit,
  receivePythonMessage,
  errorWhileExecPythonCommand,
  websocketDisconnected,
  updateCamera
} = require('./actions/actions');


const GeppettoStore = newStore();

var StoreManager = (function () {
  var instance;

  function init () {
    // Private methods and variables

    return {

      // Public methods and variables
      store: GeppettoStore,
      clientActions: clientActions,
      eventsCallback: callbacksList,
      actionsHandler: {
        [clientActions.SELECT]: (scope, geometryIdentifier, point ) => (
          GeppettoStore.dispatch(selectInstance(scope, geometryIdentifier, point))
        ),
        [clientActions.VISIBILITY_CHANGED]: instance => (
          GeppettoStore.dispatch(visibilityChanged(instance))
        ),
        [clientActions.FOCUS_CHANGED]: instance => (
          GeppettoStore.dispatch(focusChanged(instance))
        ),
        [clientActions.MODEL_LOADED]: () => (
          GeppettoStore.dispatch(modelLoaded())
        ),
        [clientActions.PROJECT_LOADING]: () => (
          GeppettoStore.dispatch(projectLoading())
        ),
        [clientActions.PROJECT_LOADED]: () => (
          GeppettoStore.dispatch(projectLoaded())
        ),
        [clientActions.PROJECT_DOWNLOADED]: () => (
          GeppettoStore.dispatch(projectDownloaded())
        ),
        [clientActions.EXPERIMENT_OVER]: experiment => (
          GeppettoStore.dispatch(experimentOver(experiment))
        ),
        [clientActions.EXPERIMENT_LOADED]: () => (
          GeppettoStore.dispatch(experimentLoaded())
        ),
        [clientActions.EXPERIMENT_PLAY]: parameters => (
          GeppettoStore.dispatch(experimentPlay(parameters))
        ),
        [clientActions.EXPERIMENT_PAUSE]: () => (
          GeppettoStore.dispatch(experimentPause())
        ),
        [clientActions.EXPERIMENT_RESUME]: () => (
          GeppettoStore.dispatch(experimentResume())
        ),
        [clientActions.EXPERIMENT_STATUS_CHECK]: () => (
          GeppettoStore.dispatch(experimentStatusCheck())
        ),
        [clientActions.EXPERIMENT_RUNNING]: id => (
          GeppettoStore.dispatch(experimentRunning(id))
        ),
        [clientActions.EXPERIMENT_STOP]: () => (
          GeppettoStore.dispatch(experimentStop())
        ),
        [clientActions.EXPERIMENT_COMPLETED]: id => (
          GeppettoStore.dispatch(experimentCompleted(id))
        ),
        [clientActions.EXPERIMENT_FAILED]: id => (
          GeppettoStore.dispatch(experimentFailed(id))
        ),
        [clientActions.EXPERIMENT_UPDATE]: parameters => (
          GeppettoStore.dispatch(experimentUpdate(parameters))
        ),
        [clientActions.EXPERIMENT_UPDATED]: () => (
          GeppettoStore.dispatch(experimentUpdated())
        ),
        [clientActions.EXPERIMENT_RENAMED]: () => (
          GeppettoStore.dispatch(experimentRenamed())
        ),
        [clientActions.EXPERIMENT_DELETED]: id => (
          GeppettoStore.dispatch(experimentDeleted(id))
        ),
        [clientActions.EXPERIMENT_ACTIVE]: () => (
          GeppettoStore.dispatch(experimentActive())
        ),
        [clientActions.EXPERIMENT_CREATED]: id => (
          GeppettoStore.dispatch(experimentCreated(id))
        ),
        [clientActions.PROJECT_PERSISTED]: () => (
          GeppettoStore.dispatch(projectPersisted())
        ),
        [clientActions.SPOTLIGHT_CLOSED]: () => (
          GeppettoStore.dispatch(spotlightClosed())
        ),
        [clientActions.SPOTLIGHT_LOADED]: () => (
          GeppettoStore.dispatch(spotlightLoaded())
        ),
        [clientActions.INSTANCE_DELETED]: instancePath => (
          GeppettoStore.dispatch(instanceDeleted(instancePath))
        ),
        [clientActions.INSTANCES_CREATED]: instances => (
          GeppettoStore.dispatch(instancesCreated(instances))
        ),
        [clientActions.SHOW_TUTORIAL]: () => (
          GeppettoStore.dispatch(showTutorial())
        ),
        [clientActions.HIDE_TUTORIAL]: () => (
          GeppettoStore.dispatch(hideTutorial())
        ),
        [clientActions.SHOW_SPINNER]: message => (
          GeppettoStore.dispatch(showSpinner(message))
        ),
        [clientActions.HIDE_SPINNER]: () => (
          GeppettoStore.dispatch(hideSpinner())
        ),
        [clientActions.COLOR_SET]: parameters => (
          GeppettoStore.dispatch(colorSet(parameters))
        ),
        [clientActions.CANVAS_INITIALISED]: () => (
          GeppettoStore.dispatch(canvasInitialised())
        ),
        [clientActions.PROJECT_MADE_PUBLIC]: () => (
          GeppettoStore.dispatch(projectMadePublic())
        ),
        [clientActions.CONTROL_PANEL_OPEN]: () => (
          GeppettoStore.dispatch(controlPanelOpen())
        ),
        [clientActions.CONTROL_PANEL_CLOSE]: () => (
          GeppettoStore.dispatch(controlPanelClose())
        ),
        [clientActions.LIT_ENTITIES_CHANGED]: () => (
          GeppettoStore.dispatch(litEntitiesChanged())
        ),
        [clientActions.COMPONENT_DESTROYED]: () => (
          GeppettoStore.dispatch(componentDestroyed())
        ),
        [clientActions.EXPERIMENT_PROPERTIES_SAVED]: () => (
          GeppettoStore.dispatch(experimentPropertiesSaved())
        ),
        [clientActions.PROJECT_PROPERTIES_SAVED]: () => (
          GeppettoStore.dispatch(projectPropertiesSaved())
        ),
        [clientActions.PARAMETERS_SET]: () => (
          GeppettoStore.dispatch(parametersSet())
        ),
        [clientActions.COMMAND_LOG]: message => (
          GeppettoStore.dispatch(commandLog(message))
        ),
        [clientActions.COMMAND_LOG_DEBUG]: message => (
          GeppettoStore.dispatch(commandLogDebug(message))
        ),
        [clientActions.COMMAND_LOG_RUN]: message => (
          GeppettoStore.dispatch(commandLogRun(message))
        ),
        [clientActions.COMMAND_CLEAR]: () => (
          GeppettoStore.dispatch(commandClear())
        ),
        [clientActions.COMMAND_TOGGLE_IMPLICIT]: () => (
          GeppettoStore.dispatch(commandToggleImplicit())
        ),
        [clientActions.RECEIVE_PYTHON_MESSAGE]: data => (
          GeppettoStore.dispatch(receivePythonMessage(data))
        ),
        [clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND]: data => (
          GeppettoStore.dispatch(errorWhileExecPythonCommand(data))
        ),
        [clientActions.WEBSOCKET_DISCONNECTED]: () => (
          GeppettoStore.dispatch(websocketDisconnected())
        ),
        [clientActions.UPDATE_CAMERA]: () => (
          GeppettoStore.dispatch(updateCamera())
        ),
      },

      injectReducer: function (key, reducer) {
        GeppettoStore.reducerManager.add(key, reducer);
        return this.store;
      }
    };
  }

  return {
    getInstance: function () {
      if (instance == null) {
        instance = init();
        // Hide the constructor so the returned object can't be new'd...
        instance.constructor = null;
      }
      return instance;
    },
  }
})();

module.exports = { StoreManager };