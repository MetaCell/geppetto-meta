import { clientActions } from '../actions';
import EventManager, { callbacksList } from '@metacell/geppetto-meta-client/common/EventManager';

export function callbacksMiddleware({ getState, dispatch }) {
  return function (next) {
    return function (action) {

      console.debug(action);
      var actionTriggered = false;
      if (callbacksList[action.type] !== undefined && callbacksList[action.type].size > 0) {
        callbacksList[action.type].forEach(item => {
          item(action);
        });
      }

      switch (action.type) {
        case clientActions.SELECT:
          // FIXME: do we really need the action focus changed? this can be handled directly by the SELECT action itself
          EventManager.actionsHandler[EventManager.clientActions.FOCUS_CHANGED](action.data.scope);
          // FIXME: do we need to use the widgetsListener?
          GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Select);
          break;
        case clientActions.PROJECT_LOADED:
          GEPPETTO.Main.startStatusWorker();
          break;
        case clientActions.LIT_ENTITIES_CHANGED:
          GEPPETTO.WidgetsListener.update(GEPPETTO.Events.Lit_entities_changed, undefined);
          break;
        default:
          break;
      }

      if (!actionTriggered) {
        next(action);
      }
      return;
    }
  }
}
