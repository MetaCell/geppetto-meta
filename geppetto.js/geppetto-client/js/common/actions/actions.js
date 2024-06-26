// Client actions
export const clientActions = {
  SELECT: "SELECTION_CHANGED",
  VISIBILITY_CHANGED: "VISIBILITY_CHANGED",
  FOCUS_CHANGED: "FOCUS_CHANGED",
  PROJECT_LOADING: "PROJECT_LOADING",
  PROJECT_LOADED: "PROJECT_LOADED",
  PROJECT_DOWNLOADED: "PROJECT_DOWNLOADED",
  PROJECT_CONFIG_LOADED: "PROJECT_CONFIG_LOADED",
  MODEL_LOADED: "MODEL_LOADED",
  MODELTREE_POPULATED: "MODELTREE_POPULATED",
  SIMULATIONTREE_POPULATED: "SIMULATIONTREE_POPULATED",
  PROJECT_PERSISTED: "PROJECT_PERSISTED",
  INSTANCE_ADDED: "INSTANCE_ADDED",
  INSTANCE_DELETED: "INSTANCE_DELETED",
  INSTANCES_CREATED: "INSTANCES_CREATED",
  SHOW_TUTORIAL: "SHOW_TUTORIAL",
  HIDE_TUTORIAL: "HIDE_TUTORIAL",
  START_TUTORIAL: "SHOW_TUTORIAL",
  STOP_TUTORIAL: "HIDE_TUTORIAL",
  SHOW_SPINNER: "SHOW_SPINNER",
  HIDE_SPINNER: "HIDE_SPINNER",
  SHOW_HELP: "SHOW_HELP",
  HIDE_HELP: "HIDE_HELP",
  SHOW_QUERYBUILDER: "SHOW_QUERYBUILDER",
  HIDE_QUERYBUILDER: "HIDE_QUERYBUILDER",
  COLOR_SET: "COLOR_SET",
  CANVAS_INITIALISED: "CANVAS_INITIALISED",
  PROJECT_MADE_PUBLIC: "PROJECT_MADE_PUBLIC",
  CONTROL_PANEL_OPEN: "CONTROL_PANEL_OPEN",
  CONTROL_PANEL_CLOSE: "CONTROL_PANEL_CLOSE",
  LIT_ENTITIES_CHANGED: "LIT_ENTITIES_CHANGED",
  COMPONENT_DESTROYED: "COMPONENT_DESTROYED",
  PROJECT_PROPERTIES_SAVED: "PROJECT_PROPERTIES_SAVED",
  PARAMETERS_SET: "PARAMETERS_SET",
  COMMAND_LOG: "COMMAND_LOG",
  COMMAND_LOG_DEBUG: "COMMAND_LOG_DEBUG",
  COMMAND_LOG_RUN: "COMMAND_LOG_RUN",
  COMMAND_CLEAR: "COMMAND_CLEAR",
  COMMAND_TOGGLE_IMPLICIT: "COMMAND_TOGGLE_IMPLICIT",
  RECEIVE_PYTHON_MESSAGE: "RECEIVE_PYTHON_MESSAGE",
  WEBSOCKET_DISCONNECTED: "WEBSOCKET_DISCONNECTED",
  ERROR_WHILE_EXEC_PYTHON_COMMAND: "ERROR_WHILE_EXEC_PYTHON_COMMAND",
  UPDATE_CAMERA: "UPDATE_CAMERA",
  SPIN_LOGO: "SPIN_LOGO",
  STOP_LOGO: "STOP_LOGO",
  SPIN_PERSIST: "SPIN_PERSIST",
  STOP_PERSIST: "STOP_PERSIST",
  GEPPETTO_ERROR: "ERROR",
  GEPPETTO_INFO: "INFO",
  JUPYTER_GEPPETTO_EXTENSION_READY: "JUPYTER_GEPPETTO_EXTENSION_READY",
  DISABLE_CONTROLS: "DISABLE_CONTROLS",
};

export const IMPORT_APPLICATION_STATE = 'IMPORT_APPLICATION_STATE';

export const selectInstance = (scope, geometryIdentifier, point) => ({
  type: clientActions.SELECT,
  data: {
    scope: scope,
    geometryIdentifier: geometryIdentifier,
    point: point
  }
});

export const visibilityChanged = instance => ({
  type: clientActions.VISIBILITY_CHANGED,
  data: { instance: instance },
});

export const focusChanged = instance => ({
  type: clientActions.FOCUS_CHANGED,
  data: { instance: instance },
});

export const modelLoaded = () => ({
  type: clientActions.MODEL_LOADED,
  data: { model_status: clientActions.MODEL_LOADED },
});

export const projectLoading = () => ({
  type: clientActions.PROJECT_LOADING,
  data: { project_status: clientActions.PROJECT_LOADING },
});

export const projectLoaded = () => ({
  type: clientActions.PROJECT_LOADED,
  data: { project_status: clientActions.PROJECT_LOADED },
});

export const projectDownloaded = () => ({
  type: clientActions.PROJECT_DOWNLOADED,
  data: { project_status: clientActions.PROJECT_DOWNLOADED },
});

export const projectPersisted = () => ({
  type: clientActions.PROJECT_PERSISTED,
  data: { project_status: clientActions.PROJECT_PERSISTED },
});

export const projectConfigLoaded = configuration => ({
  type: clientActions.PROJECT_CONFIG_LOADED,
  data: configuration,
});

// HERE
export const instanceDeleted = instancePath => ({
  type: clientActions.INSTANCE_DELETED,
  data: instancePath,
});

export const instancesCreated = instances => ({
  type: clientActions.INSTANCES_CREATED,
  data: instances,
});

export const showTutorial = () => ({ type: clientActions.SHOW_TUTORIAL, });

export const hideTutorial = () => ({ type: clientActions.HIDE_TUTORIAL, });

export const showQueryBuilder = () => ({ type: clientActions.SHOW_QUERYBUILDER, });

export const hideQueryBuilder = () => ({ type: clientActions.HIDE_QUERYBUILDER, });

export const startTutorial = () => ({ type: clientActions.START_TUTORIAL, });

export const stopTutorial = () => ({ type: clientActions.STOP_TUTORIAL, });

export const showSpinner = (message, offAction = null) => ({
  type: clientActions.SHOW_SPINNER,
  data: { message, offAction },
});

export const waitData = showSpinner;

export const hideSpinner = () => ({ type: clientActions.HIDE_SPINNER, });

export const showHelp = () => ({ type: clientActions.SHOW_HELP, });

export const hideHelp = () => ({ type: clientActions.HIDE_HELP, });

export const canvasInitialised = () => ({ type: clientActions.CANVAS_INITIALISED, });

export const projectMadePublic = () => ({ type: clientActions.PROJECT_MADE_PUBLIC, });

export const controlPanelOpen = () => ({ type: clientActions.CONTROL_PANEL_OPEN, });

export const controlPanelClose = () => ({ type: clientActions.CONTROL_PANEL_CLOSE, });

export const litEntitiesChanged = () => ({ type: clientActions.LIT_ENTITIES_CHANGED, });

export const componentDestroyed = () => ({ type: clientActions.COMPONENT_DESTROYED, });

export const projectPropertiesSaved = () => ({ type: clientActions.PROJECT_PROPERTIES_SAVED, });

export const parametersSet = () => ({
  type: clientActions.PARAMETERS_SET,
  data: { timestamp: new Date().getTime().toString() },
});

export const commandLog = message => ({
  type: clientActions.COMMAND_LOG,
  data: {
    message: message,
    timestamp: new Date().getTime().toString()
  },
});

export const commandLogDebug = message => ({
  type: clientActions.COMMAND_LOG_DEBUG,
  data: {
    message: message,
    timestamp: new Date().getTime().toString()
  },
});

export const commandLogRun = message => ({
  type: clientActions.COMMAND_LOG_RUN,
  data: {
    message: message,
    timestamp: new Date().getTime().toString()
  },
});

export const commandClear = () => ({
  type: clientActions.COMMAND_CLEAR,
  data: { timestamp: new Date().getTime().toString() },
});

export const commandToggleImplicit = () => ({
  type: clientActions.COMMAND_TOGGLE_IMPLICIT,
  data: { timestamp: new Date().getTime().toString() },
});

export const receivePythonMessage = data => ({
  type: clientActions.COMMAND_TOGGLE_IMPLICIT,
  data: {
    id: data.id,
    type: data.type,
    response: data.response,
    timestamp: new Date().getTime().toString()
  },
});

export const errorWhileExecPythonCommand = data => ({
  type: clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND,
  data: {
    id: undefined,
    type: "ERROR",
    response: data,
    timestamp: new Date().getTime().toString()
  },
});

export const websocketDisconnected = () => ({ type: clientActions.WEBSOCKET_DISCONNECTED, });

export const updateCamera = () => ({
  type: clientActions.UPDATE_CAMERA,
  data: new Date().getTime().toString()
});

export const spinLogo = () => ({ type: clientActions.SPIN_LOGO, });

export const stopLogo = () => ({ type: clientActions.STOP_LOGO, });

export const geppettoError = message => ({
  type: clientActions.GEPPETTO_ERROR,
  data: {
    latestUpdate: new Date().getTime().toString(),
    message: message
  }
});

export const geppettoInfo = message => ({
  type: clientActions.GEPPETTO_INFO,
  data: {
    latestUpdate: new Date().getTime().toString(),
    message: message
  }
});

export const spinPersist = () => ({ type: clientActions.SPIN_PERSIST, });

export const stopPersist = () => ({ type: clientActions.STOP_PERSIST, });

export const jupyterGeppettoExtensionReady = () => ({ type: clientActions.JUPYTER_GEPPETTO_EXTENSION_READY, });

export const disableControls = () => ({ type: clientActions.DISABLE_CONTROLS, });

