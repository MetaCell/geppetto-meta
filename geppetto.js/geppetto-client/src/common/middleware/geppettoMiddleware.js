import { clientActions } from '../actions';
import EventManager, { callbacksList } from '../../common/EventManager';
import MessageSocket from '../../communication/MessageSocket';

export function callbacksMiddleware ({ getState, dispatch }) {
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
        break;
      case clientActions.PROJECT_LOAD_FROM_ID:
        MessageSocket.loadProjectFromId(action.data);
        break;
      case clientActions.PROJECT_LOAD_FROM_URL:
        MessageSocket.loadProjectFromUrl(action.data);
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
