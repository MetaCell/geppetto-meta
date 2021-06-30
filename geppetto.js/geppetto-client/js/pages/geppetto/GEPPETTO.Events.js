/**
 * Events
 *
 * Different types of events that exist
 * 
 * @deprecated
 * @enum
 */
export default function (GEPPETTO) {
  /**
   * @class GEPPETTO.Events
   */
  GEPPETTO.Events = {
    Project_loading: "project:loading",
    Project_loaded: "project:loaded",
    Project_downloaded: "project:downloaded",
    Model_loaded: "model:loaded",
    Project_persisted: "project:persisted",
    Instance_deleted: "instance:deleted",
    Instances_created: "instances:created",
    Instance_added: "instance:added",
    Show_Tutorial: "show_tutorial",
    Hide_Tutorial: "hide_tutorial",
    Show_spinner: "spinner:show",
    Hide_spinner: "spinner:hide",
    Color_set: "color:set",
    Canvas_initialised: "canvas:initialised",
    Project_made_public: "project_made_public",
    Control_panel_open: "control_panel:open",
    Control_panel_close: "control_panel:close",
    Lit_entities_changed: "lit_entities_changed",
    Component_destroyed: "component_destroyed",
    Project_properties_saved : "project_properties_saved",
    Parameters_set : "parameters_set",
    Command_log : "command:log",
    Command_log_debug : "command:log_debug",
    Command_log_run : "command:log_run",
    Command_clear : "command:clear",
    Command_toggle_implicit : "command:toggle_implicit",
    Receive_Python_Message: "receive_python_message",
    Websocket_disconnected : "websocket_disconnected",
    Error_while_exec_python_command: "error_while_exec_python_command",
    Update_camera : "update_camera",

    listen: function () {
    }
  };
}
