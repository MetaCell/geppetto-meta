/**
 *
 * Global objects. Handles global operations; clearing js console history commands,
 * turning on/off debug statements, copying history commands, help info, etc.
 *
 * @author  Jesus R. Martinez (jesus@metacell.us)
 */
define(function (require) {
  return function (GEPPETTO) {

    var $ = require('jquery');
    var EventManager = require('@metacell/geppetto-meta-client/common/EventManager').default

    /**
     * @exports geppetto-objects/G
     */
    GEPPETTO.G = {

      selectionOptions: {
        show_inputs: true,
        show_outputs: true,
        draw_connection_lines: true,
        unselected_transparent: true
      },

      // TODO Design something better to hold abritrary status
      timeWidget: {},
      timeWidgetVisible: false,
      recordedVariablesWidget: {},
      recordedVariablesPlot: false,
      enableColorPlottingActive: false,
      consoleFocused: true,
      debugMode: false,

      isConsoleFocused: function () {
        return this.consoleFocused;
      },

      autoFocusConsole: function (mode) {
        this.consoleFocused = mode;
      },

      /**
       * Adds widgets to Geppetto
       *
       * @param type
       * @param isStateless
       * @returns {*}
       */
      addWidget: function (type, properties, callback) {
        return GEPPETTO.ComponentFactory.addWidget(type, properties, callback);
      },

      /**
       * Gets list of available widgets
       *
       * @command G.availableWidgets()
       * @returns {List} - List of available widget types
       */
      availableWidgets: function () {
        return GEPPETTO.Widgets;
      },

      /**
       * Clears the console history
       *
       * @command G.clear()
       */
      clear: function () {
        GEPPETTO.CommandController.clear();
        return GEPPETTO.Resources.CLEAR_HISTORY;
      },

      /**
       * Toggles debug statement on/off
       *
       * @param mode
       * @return {string}
       */
      debug: function (mode) {
        this.debugMode = mode;

        GEPPETTO.CommandController.toggleImplicit();

        return mode ? GEPPETTO.Resources.DEBUG_ON : GEPPETTO.Resources.DEBUG_OFF;
      },

      /**
       * State of debug statements, whether they are turned on or off.
       *
       * @returns {boolean} Returns true or false depending if debug statements are turned on or off.
       */
      isDebugOn: function () {
        return this.debugMode;
      },

      /**
       * Retrieve a cookie
       */
      getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length).replace(/"/g, '');
          }
        }
        return "";
      },

      /**
       * Get all commands and descriptions available for object G.
       *
       * @command G.help()
       * @returns {String} All commands and descriptions for G.
       */
      help: function () {
        return this;
      },

      /**
       * Sets idle timeout, -1 for no timeout
       *
       * @param timeOut
       */
      setIdleTimeOut: function (timeOut) {
        GEPPETTO.Main.idleTime = timeOut;
      },

      /**
       * Enables Geppetto local storage features (persist views with no db)
       *
       * @param enabled
       */
      enableLocalStorage: function (enabled) {
        GEPPETTO.Main.localStorageEnabled = enabled;
      },

      /**
       * Removes widget from Geppetto
       *
       * @command G.removeWidget(widgetType)
       * @param {WIDGET_EVENT_TYPE} type - Type of widget to remove from GEPPETTO. If no type is passed remove all the widgets from Geppetto.
       */
      removeWidget: function (type) {
        if (type) {
          return GEPPETTO.WidgetFactory.removeWidget(type);
        } else {
          for (var widgetKey in GEPPETTO.Widgets) {
            GEPPETTO.WidgetFactory.removeWidget(GEPPETTO.Widgets[widgetKey]);
          }
        }
      },

      /**
       * Takes the URL corresponding to a script, executes
       * commands inside the script.
       *
       * @command G.runScript(scriptURL)
       * @param {URL} scriptURL - URL of script to execute
       */
      runScript: function (scriptURL) {
        var parameters = {};
        parameters.scriptURL = scriptURL;
        parameters.projectId = Project.getId();
        GEPPETTO.MessageSocket.send("get_script", parameters);

        return GEPPETTO.Resources.RUNNING_SCRIPT;
      },

      /**
       * Show or hide help window using command
       *
       * @command G.showHelpWindow(mode)
       * @param {boolean} mode - "true" to show, "false" to hide.
       */
      showHelpWindow: function (mode) {
        var returnMessage;

        if (mode) {
          EventManager.actionsHandler[EventManager.clientActions.SHOW_HELP]();
          returnMessage = GEPPETTO.Resources.SHOW_HELP_WINDOW;
        } else {
          var modalVisible = $('#help-modal').hasClass('in');
          // don't try to hide already hidden help window
          if (!modalVisible) {
            returnMessage = GEPPETTO.Resources.HELP_ALREADY_HIDDEN;
          } else {
            // hide help window
            EventManager.actionsHandler[EventManager.clientActions.HIDE_HELP]();
            returnMessage = GEPPETTO.Resources.HIDE_HELP_WINDOW;
            $('#help-modal').modal('hide');
          }
        }
        return returnMessage;
      },

      toggleTutorial: function () {
        var returnMessage;
        var modalVisible = $('#tutorial_dialog').is(':visible');

        if (modalVisible) {
          EventManager.actionsHandler[EventManager.clientActions.SHOW_TUTORIAL]();
          returnMessage = GEPPETTO.Resources.HIDE_TUTORIAL;
        } else {
          EventManager.actionsHandler[EventManager.clientActions.HIDE_TUTORIAL]();
          returnMessage = GEPPETTO.Resources.SHOW_TUTORIAL;
        }
        return returnMessage;
      },

      /**
       * Sets options that happened during selection of an entity. For instance,
       * user can set things that happened during selection as if connections inputs and outputs are shown,
       * if connection lines are drawn and if other entities that were not selected are still visible.
       *
       * @param {Object} options - New set of options for selection process
       */
      setOnSelectionOptions: function (options) {
        if (options.show_inputs != null) {
          this.selectionOptions.show_inputs = options.show_inputs;
        }
        if (options.show_outputs != null) {
          this.selectionOptions.show_outputs = options.show_outputs;
        }
        if (options.draw_connection_lines != null) {
          this.selectionOptions.draw_connection_lines = options.draw_connection_lines;
        }
        if (options.unselected_transparent != null) {
          this.selectionOptions.unselected_transparent = options.unselected_transparent;
        }
      },

      /**
       * Options set for the selection event, turning on/off connections and lines.
       *
       * @returns {Object} Options for selection.
       */
      getSelectionOptions: function () {
        return this.selectionOptions;
      },

      /**
       * Set canvas color.
       *
       * @command G.setBackgroundColour(color)
       *
       * * @param {String} color - hex or rgb color. e.g. "#ff0000" / "rgb(255,0,0)"
       */
      setBackgroundColour: function (color) {
        $("body").css("background", color);
      }

    };
  };
});
