/**
 *
 * @author Matteo Cantarelli
 * @authot Jesus R Martinez (jesus@metacell.us)
 * @deprecated
 */


const EventManager = require('./common/EventManager').default;
const Events = require('./Events').default;
const Resources = require('@metacell/geppetto-meta-core/Resources').default;


const Manager = require('./common/GeppettoManager').default;
const ComponentFactory = require('./components/ComponentFactory').default;

const ModelFactory = require('@metacell/geppetto-meta-core/ModelFactory').default;
require('./style/less/main.less')

/**
 * Initialise Geppetto
 *
 * @class GEPPETTO
 */
const GEPPETTO = {

  debug: true,
  Resources,
  Manager,
  ModelFactory,
  Events,
  /**
   * @param{String} key - The pressed key
   * @returns {boolean} True if the key is pressed
   */
  isKeyPressed: function (key) {
    return this.keyboard.pressed(key);
  },

  /**
   * @param msg
   */
  log: function (msg) {

    var d = new Date();
    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var curr_sec = d.getSeconds();
    var curr_msec = d.getMilliseconds();
    console.debug(curr_hour + ":" + curr_min + ":" + curr_sec + ":" + curr_msec + ' - ' + msg, "");

  },

  /**
   * @param category
   * @param action
   * @param opt_label
   * @param opt_value
   * @param opt_noninteraction
   */
  trackActivity: function (category, action, opt_label, opt_value, opt_noninteraction) {
    if (typeof _gaq != 'undefined') {
      _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
    }
  },

  winHeight: function () {
    return window.innerHeight || (document.documentElement || document.body).clientHeight;
  },

  trigger: function (...args) {
    if (args.length == 0) {
      console.error("Trigger should be provided of the event to trigger");
      return;
    } else {
      const _event = args.shift();
      const handleFn = EventManager.actionsHandler[EventsMapping[_event]];
      if (handleFn) {
        handleFn(...args);
      }
    }
  },

  on: function (eventName, callback) {
    EventManager.eventsCallback[EventsMapping[eventName]].add(callback)
  },

  off: function (eventName, callback = null) {
    if (!eventName && callback) {
      for (const l of Object.values(EventManager.eventsCallback)) {
        EventManager.eventsCallback[EventsMapping[l]].delete(callback)
      }
    } else if (eventName && !callback) {
      EventManager.eventsCallback[EventsMapping[eventName]].clear()
    } else if (eventName && callback) {
      EventManager.eventsCallback[EventsMapping[eventName]].delete(callback)
    } else {
      for (const l of Object.values(EventManager.eventsCallback)) {
        EventManager.eventsCallback[EventsMapping[l]].clear(callback)
      }
    }
  },
};

const EventsMapping = {
  [Events.Select]: EventManager.clientActions.SELECT,
  [Events.Visibility_changed]: EventManager.clientActions.VISIBILITY_CHANGED,
  [Events.Focus_changed]: EventManager.clientActions.FOCUS_CHANGED,
  [Events.Project_loading]: EventManager.clientActions.PROJECT_LOADING,
  [Events.Project_loaded]: EventManager.clientActions.PROJECT_LOADED,
  [Events.Project_downloaded]: EventManager.clientActions.PROJECT_DOWNLOADED,
  [Events.Model_loaded]: EventManager.clientActions.MODEL_LOADED,
  [Events.ModelTree_populated]: EventManager.clientActions.MODELTREE_POPULATED,
  [Events.SimulationTree_populated]: EventManager.clientActions.SIMULATIONTREE_POPULATED,
  [Events.Instance_deleted]: EventManager.clientActions.INSTANCE_DELETED,
  [Events.Instances_created]: EventManager.clientActions.INSTANCES_CREATED,
  [Events.Instance_added]: EventManager.clientActions.INSTANCE_ADDED,
  [Events.Show_spinner]: EventManager.clientActions.SHOW_SPINNER,
  [Events.Hide_spinner]: EventManager.clientActions.HIDE_SPINNER,
  [Events.Color_set]: EventManager.clientActions.COLOR_SET,
  [Events.Project_made_public]: EventManager.clientActions.PROJECT_MADE_PUBLIC,
  [Events.Lit_entities_changed]: EventManager.clientActions.LIT_ENTITIES_CHANGED,
  [Events.Component_destroyed]: EventManager.clientActions.COMPONENT_DESTROYED,
  [Events.Project_properties_saved]: EventManager.clientActions.PROJECT_PROPERTIES_SAVED,
  [Events.Parameters_set]: EventManager.clientActions.PARAMETERS_SET,
  [Events.Receive_Python_Message]: EventManager.clientActions.RECEIVE_PYTHON_MESSAGE,
  [Events.Websocket_disconnected]: EventManager.clientActions.WEBSOCKET_DISCONNECTED,
  [Events.Error_while_exec_python_command]: EventManager.clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND,
  [Events.Jupyter_geppetto_extension_ready]: EventManager.clientActions.JUPYTER_GEPPETTO_EXTENSION_READY,
};

export function initGeppetto (useWebsocket = true, loadStyle = true) {
  if (!window.GEPPETTO_CONFIGURATION) {
    window.GEPPETTO_CONFIGURATION = {}
  }
  if (useWebsocket) {
    const WSMain = require('./WebsocketMain').default;
    WSMain.init();
    GEPPETTO.MessageSocket = WSMain.socket
  }

  if (loadStyle) {
    require('./style/less/main.less');
  }

  GEPPETTO.ComponentFactory = ComponentFactory;
  window.GEPPETTO = GEPPETTO;
}

export default GEPPETTO;


