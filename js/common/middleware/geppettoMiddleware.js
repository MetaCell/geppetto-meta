import { clientActions } from '../actions/actions';

export const callbacksList = {
  [clientActions.SELECT]: { 'list': [] },
  [clientActions.VISIBILITY_CHANGED]: { 'list': [] },
  [clientActions.FOCUS_CHANGED]: { 'list': [] },
  [clientActions.EXPERIMENT_OVER]: { 'list': [] },
  [clientActions.PROJECT_LOADING]: { 'list': [] },
  [clientActions.PROJECT_LOADED]: { 'list': [] },
  [clientActions.PROJECT_DOWNLOADED]: { 'list': [] },
  [clientActions.MODEL_LOADED]: { 'list': [] },
  [clientActions.EXPERIMENT_LOADED]: { 'list': [] },
  [clientActions.MODELTREE_POPULATED]: { 'list': [] },
  [clientActions.SIMULATIONTREE_POPULATED]: { 'list': [] },
  [clientActions.DO_EXPERIMENT_PLAY]: { 'list': [] },
  [clientActions.EXPERIMENT_PLAY]: { 'list': [] },
  [clientActions.EXPERIMENT_STATUS_CHECK]: { 'list': [] },
  [clientActions.EXPERIMENT_PAUSE]: { 'list': [] },
  [clientActions.EXPERIMENT_RESUME]: { 'list': [] },
  [clientActions.EXPERIMENT_RUNNING]: { 'list': [] },
  [clientActions.EXPERIMENT_STOP]: { 'list': [] },
  [clientActions.EXPERIMENT_COMPLETED]: { 'list': [] },
  [clientActions.EXPERIMENT_FAILED]: { 'list': [] },
  [clientActions.EXPERIMENT_UPDATE]: { 'list': [] },
  [clientActions.EXPERIMENT_UPDATED]: { 'list': [] },
  [clientActions.EXPERIMENT_RENAMED]: { 'list': [] },
  [clientActions.EXPERIMENT_DELETED]: { 'list': [] },
  [clientActions.EXPERIMENT_ACTIVE]: { 'list': [] },
  [clientActions.EXPERIMENT_CREATED]: { 'list': [] },
  [clientActions.PROJECT_PERSISTED]: { 'list': [] },
  [clientActions.SPOTLIGHT_CLOSED]: { 'list': [] },
  [clientActions.SPOTLIGHT_LOADED]: { 'list': [] },
  [clientActions.INSTANCE_DELETED]: { 'list': [] },
  [clientActions.INSTANCES_CREATED]: { 'list': [] },
  [clientActions.SHOW_TUTORIAL]: { 'list': [] },
  [clientActions.HIDE_TUTORIAL]: { 'list': [] },
  [clientActions.SHOW_SPINNER]: { 'list': [] },
  [clientActions.HIDE_SPINNER]: { 'list': [] },
  [clientActions.COLOR_SET]: { 'list': [] },
  [clientActions.CANVAS_INITIALISED]: { 'list': [] },
  [clientActions.PROJECT_MADE_PUBLIC]: { 'list': [] },
  [clientActions.CONTROL_PANEL_OPEN]: { 'list': [] },
  [clientActions.CONTROL_PANEL_CLOSE]: { 'list': [] },
  [clientActions.LIT_ENTITIES_CHANGED]: { 'list': [] },
  [clientActions.COMPONENT_DESTROYED]: { 'list': [] },
  [clientActions.EXPERIMENT_PROPERTIES_SAVED]: { 'list': [] },
  [clientActions.PROJECT_PROPERTIES_SAVED]: { 'list': [] },
  [clientActions.PARAMETERS_SET]: { 'list': [] },
  [clientActions.COMMAND_LOG]: { 'list': [] },
  [clientActions.COMMAND_LOG_DEBUG]: { 'list': [] },
  [clientActions.COMMAND_LOG_RUN]: { 'list': [] },
}

export function callbacksMiddleware ({ getState, dispatch }) {
  return function (next) {
    return function (action) {
      next(action);

      if (callbacksList[action.type] !== undefined && callbacksList[action.type].list.length > 0) {
        callbacksList[action.type].list.map(item => {
          item(action);
        });
      }

      switch (action.type) {
      case clientActions.SELECT:
        // FIXME: do we really need the action focus changed? this can be handled directly by the SELECT action itself
        GEPPETTO.StoreManager.actionsHandler[GEPPETTO.StoreManager.clientActions.FOCUS_CHANGED](action.data.scope);
        // FIXME: do we need to use the widgetsListener?
        GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Select);
        break;
      case clientActions.DO_EXPERIMENT_PLAY:
        Project.getActiveExperiment().playAll();
        break;
      case clientActions.EXPERIMENT_ACTIVE:
        GEPPETTO.WidgetsListener.update(GEPPETTO.WidgetsListener.WIDGET_EVENT_TYPE.DELETE);
        break;
      case clientActions.EXPERIMENT_PLAY:
        GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_play, action.data.parameters);
        break;
      case clientActions.EXPERIMENT_LOADED:
        // From the ProjectController
        GEPPETTO.ProjectsController.refreshUserProjects();
        // From the GEPPETTO.Events
        if (GEPPETTO.UserController.isLoggedIn()) {
          GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
        }
        break;
      case clientActions.EXPERIMENT_OVER:
        GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_over);
        var id = action.data.experiment.id;
        var name = action.data.experiment.name;
        if (GEPPETTO.ExperimentsController.playLoop === true) {
          Project.getActiveExperiment().play({ step: 1 });
        } else {
          GEPPETTO.CommandController.log("Experiment " + name + " with " + id + " is over ");
        }
        break;
      case clientActions.EXPERIMENT_UPDATE:
        GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Experiment_update, action.data.parameters);
        break;
      case clientActions.PROJECT_LOADED:
        GEPPETTO.Main.startStatusWorker();
        break;
      case clientActions.SPOTLIGHT_CLOSED:
        GEPPETTO.Flows.onSpotlightExitFlowCallback();
        break;
      default:
        break;
      }
      return;
    }
  }
}
