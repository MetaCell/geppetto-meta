/**
 *
 * @author Matteo Cantarelli
 * @authot Jesus R Martinez (jesus@metacell.us)
 * @deprecated
 */
define(function (require) {

  var $ = require('jquery'), _ = require('underscore');
  var THREEx = require('./THREEx.KeyboardState'); // Nothing to do with THREE
  var EventManager = require('../../common/EventManager').default;

  /*
   * These two libraries are required here so that Geppetto can work properly in an iframe (as embedded website).
   * Otherwise, sometimes (randomly)  these libraries are not loaded on time and some js commands failed and the web is not loaded properly.
   */
  require('jquery-ui-bundle');
  require('bootstrap');

  /**
   * Initialise Geppetto
   *
   * @class GEPPETTO
   */
  var GEPPETTO = {

    debug: false,
    keyboard: new THREEx.KeyboardState(),
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
      if (GEPPETTO.debug) {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();
        var curr_msec = d.getMilliseconds();
        console.log(curr_hour + ":" + curr_min + ":" + curr_sec + ":" + curr_msec + ' - ' + msg, "");
      }
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
        const handleFn = EventManager.actionsHandler[GEPPETTO.eventsMapping[_event]];
        if (handleFn) {
          handleFn(...args);
        }
      }
    },

    on: function (eventName, callback) {
      EventManager.eventsCallback[GEPPETTO.eventsMapping[eventName]].add(callback)
    },

    off: function (eventName, callback = null) {
      if (!eventName && callback) {
        for (const l of Object.values(EventManager.eventsCallback)) {
          EventManager.eventsCallback[GEPPETTO.eventsMapping[l]].delete(callback)
        }
      } else if (eventName && !callback) {
        EventManager.eventsCallback[GEPPETTO.eventsMapping[eventName]].clear()
      } else if (eventName && callback) {
        EventManager.eventsCallback[GEPPETTO.eventsMapping[eventName]].delete(callback)
      } else {
        for (const l of Object.values(EventManager.eventsCallback)) {
          EventManager.eventsCallback[GEPPETTO.eventsMapping[l]].clear(callback)
        }
      }
    },
  };

  GEPPETTO.Resources = require('@metacell/geppetto-meta-core/Resources').default;
  require('../../common/GEPPETTO.CommandController')(GEPPETTO);
  require('./GEPPETTO.Events').default(GEPPETTO);

  require('../../common/GEPPETTO.Utility')(GEPPETTO);
  require('../../communication/MessageSocket')(GEPPETTO);
  require('../../communication/GEPPETTO.GlobalHandler')(GEPPETTO);

  GEPPETTO.Manager = new (require('../../common/Manager').default)();

  require('../../communication/MessageHandler')(GEPPETTO);
  require('./G')(GEPPETTO);
  require('./GEPPETTO.Main')(GEPPETTO);
  require('@metacell/geppetto-meta-core/ProjectFactory')(GEPPETTO);
  require('@metacell/geppetto-meta-core/ModelFactory').default(GEPPETTO);
  require('../../geppettoProject/ProjectsController')(GEPPETTO);

  GEPPETTO.eventsMapping = {
    [GEPPETTO.Events.Select]: EventManager.clientActions.SELECT,
    [GEPPETTO.Events.Visibility_changed]: EventManager.clientActions.VISIBILITY_CHANGED,
    [GEPPETTO.Events.Focus_changed]: EventManager.clientActions.FOCUS_CHANGED,
    [GEPPETTO.Events.Project_loading]: EventManager.clientActions.PROJECT_LOADING,
    [GEPPETTO.Events.Project_loaded]: EventManager.clientActions.PROJECT_LOADED,
    [GEPPETTO.Events.Project_downloaded]: EventManager.clientActions.PROJECT_DOWNLOADED,
    [GEPPETTO.Events.Model_loaded]: EventManager.clientActions.MODEL_LOADED,
    [GEPPETTO.Events.ModelTree_populated]: EventManager.clientActions.MODELTREE_POPULATED,
    [GEPPETTO.Events.SimulationTree_populated]: EventManager.clientActions.SIMULATIONTREE_POPULATED,
    [GEPPETTO.Events.Project_persisted]: EventManager.clientActions.PROJECT_PERSISTED,
    [GEPPETTO.Events.Instance_deleted]: EventManager.clientActions.INSTANCE_DELETED,
    [GEPPETTO.Events.Instances_created]: EventManager.clientActions.INSTANCES_CREATED,
    [GEPPETTO.Events.Instance_added]: EventManager.clientActions.INSTANCE_ADDED,
    [GEPPETTO.Events.Show_Tutorial]: EventManager.clientActions.SHOW_TUTORIAL,
    [GEPPETTO.Events.Hide_Tutorial]: EventManager.clientActions.HIDE_TUTORIAL,
    [GEPPETTO.Events.Show_spinner]: EventManager.clientActions.SHOW_SPINNER,
    [GEPPETTO.Events.Hide_spinner]: EventManager.clientActions.HIDE_SPINNER,
    [GEPPETTO.Events.Color_set]: EventManager.clientActions.COLOR_SET,
    [GEPPETTO.Events.Canvas_initialised]: EventManager.clientActions.CANVAS_INITIALISED,
    [GEPPETTO.Events.Project_made_public]: EventManager.clientActions.PROJECT_MADE_PUBLIC,
    [GEPPETTO.Events.Control_panel_open]: EventManager.clientActions.CONTROL_PANEL_OPEN,
    [GEPPETTO.Events.Control_panel_close]: EventManager.clientActions.CONTROL_PANEL_CLOSE,
    [GEPPETTO.Events.Lit_entities_changed]: EventManager.clientActions.LIT_ENTITIES_CHANGED,
    [GEPPETTO.Events.Component_destroyed]: EventManager.clientActions.COMPONENT_DESTROYED,
    [GEPPETTO.Events.Project_properties_saved]: EventManager.clientActions.PROJECT_PROPERTIES_SAVED,
    [GEPPETTO.Events.Parameters_set]: EventManager.clientActions.PARAMETERS_SET,
    [GEPPETTO.Events.Command_log]: EventManager.clientActions.COMMAND_LOG,
    [GEPPETTO.Events.Command_log_debug]: EventManager.clientActions.COMMAND_LOG_DEBUG,
    [GEPPETTO.Events.Command_log_run]: EventManager.clientActions.COMMAND_LOG_RUN,
    [GEPPETTO.Events.Command_clear]: EventManager.clientActions.COMMAND_CLEAR,
    [GEPPETTO.Events.Command_toggle_implicit]: EventManager.clientActions.COMMAND_TOGGLE_IMPLICIT,
    [GEPPETTO.Events.Receive_Python_Message]: EventManager.clientActions.RECEIVE_PYTHON_MESSAGE,
    [GEPPETTO.Events.Websocket_disconnected]: EventManager.clientActions.WEBSOCKET_DISCONNECTED,
    [GEPPETTO.Events.Error_while_exec_python_command]: EventManager.clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND,
    [GEPPETTO.Events.Update_camera]: EventManager.clientActions.UPDATE_CAMERA,
  };
  return GEPPETTO;

});
