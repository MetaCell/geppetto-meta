
/**
 *
 * Events
 *
 * Different types of events that exist
 *
 * @enum
 */
define(function (require) {
    return function (GEPPETTO) {
        /**
         * @class GEPPETTO.Events
         */
        GEPPETTO.Events = {

            Select: "experiment:selection_changed",
			Visibility_changed : "experiment:visibility_changed",
			Focus_changed: "experiment:focus_changed",
			Experiment_over: "experiment:over",
			Project_loading: "project:loading",
			Project_loaded: "project:loaded",
			Model_loaded: "model:loaded",
			Experiment_loaded: "experiment:loaded",
			ModelTree_populated: "experiment:modeltreepopulated",
			SimulationTree_populated: "experiment:simulationtreepopulated",
		    Do_experiment_play: "experiment:doPlay",
			Experiment_play: "experiment:play",
			Experiment_status_check: "experiment:status_check",
			Experiment_pause: "experiment:pause",
			Experiment_resume: "experiment:resume",
			Experiment_running: "experiment:running",
			Experiment_stop: "experiment:stop",
			Experiment_completed: "experiment:completed",
			Experiment_failed: "experiment:failed",
			Experiment_update: "experiment:update",
			Experiment_updated: "experiment:updated",
			Experiment_deleted: "experiment_deleted",
			Experiment_active: "experiment_active",
			Experiment_created:"experiment:created",
			Project_persisted: "project:persisted",
			Spotlight_closed: "spotlight:closed",
		    Spotlight_loaded: "spotlight:loaded",
			Instance_deleted: "instance:deleted",
			Instances_created: "instances:created",
			Show_Tutorial : "show_tutorial",
			Hide_Tutorial : "hide_tutorial",
			Show_spinner: "spinner:show",
			Hide_spinner: "spinner:hide",
			Color_set: "color:set",
 			Canvas_initialised: "canvas:initialised",
			Project_made_public : "project_made_public",
			Control_panel_open: "control_panel:open",
			Control_panel_close: "control_panel:close",
			Lit_entities_changed: "lit_entities_changed",

            listening: false,

            listen: function () {
                GEPPETTO.on(this.Select, function () {
                    //notify widgets that selection has changed in scene
                    GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Select);

                    //trigger focus change event
                    GEPPETTO.trigger(GEPPETTO.Events.Focus_changed);
                });
                GEPPETTO.on(this.Model_loaded, function () {
                    G.resetCamera();
                });
                GEPPETTO.on(this.Experiment_active, function () {
                    GEPPETTO.WidgetsListener.update(GEPPETTO.WidgetsListener.WIDGET_EVENT_TYPE.DELETE);
                });
                GEPPETTO.on(this.Experiment_loaded, function () {
                    if (GEPPETTO.UserController.isLoggedIn()) {
                        GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
                    }
                });
                GEPPETTO.on(this.Project_loaded, function () {
                    var projectID = window.Project.getId();
                    GEPPETTO.Main.startStatusWorker();
                });
                GEPPETTO.on(this.Experiment_over, function (e) {
                    var name = e.name;
                    var id = e.id;

                    //notify listeners experiment has finished playing
                    GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_over);

                    // check if we are in looping mode
                    if (GEPPETTO.getVARS().playLoop === true) {
                        Project.getActiveExperiment().play({ step: 1 });
                    }
                    else {
                        GEPPETTO.Console.log("Experiment " + name + " with " + id + " is over ");
                    }
                });
                GEPPETTO.on(this.Experiment_play, function (parameters) {
                    GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_play, parameters);
                });
                GEPPETTO.on(this.Experiment_update, function (parameters) {
                    if (parameters.playAll != null || parameters.step != undefined) {
                        //update scene brightness
                        for (var key in GEPPETTO.G.listeners) {
                            if (GEPPETTO.G.listeners[key] != null || undefined) {
                                for (var i = 0; i < GEPPETTO.G.listeners[key].length; i++) {
                                    GEPPETTO.G.listeners[key][i](Instances.getInstance(key), parameters.step);
                                }
                            }
                        }
                    }
                    //notify widgets a restart of data is needed
                    GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_update, parameters);
                });
                GEPPETTO.on(this.Experiment_stop, function (parameters) {
                });
                GEPPETTO.on(this.Lit_entities_changed, function (parameters) {
                    GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Lit_entities_changed, parameters);
                });
		GEPPETTO.on(this.Do_experiment_play, function () {
                    Project.getActiveExperiment().playAll();
                });
            }
        };
    }
});
