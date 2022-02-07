import Resources from '@metacell/geppetto-meta-core/Resources';

import { clientActions, backendActions } from '../actions';
import Manager from '../../common/GeppettoManager';
import EventManager, { callbacksList } from '../../common/EventManager';
import MessageSocket from '../../communication/MessageSocket';

export function callbacksMiddleware ({ getState, dispatch }) {
  return function (next) {
    return function (action) {


      const onError = payload => {
        EventManager.geppettoError(payload.message);
      }


      const onGeppettoVersion = payload => {
        const version = payload;
        const geppettoVersion = Resources.GEPPETTO_VERSION_HOLDER.replace("$1", version);
        console.log(geppettoVersion);
      }

      console.debug(action);
      var actionTriggered = false;
      if (callbacksList[action.type] !== undefined && callbacksList[action.type].size > 0) {
        callbacksList[action.type].forEach(item => {
          item(action);
        });
      }

      switch (action.type) {
      // case clientActions.PROJECT_LOAD_FROM_ID:
      //   MessageSocket.loadProjectFromId(action.data);
      //   break;
      case clientActions.PROJECT_LOAD_FROM_URL:
        MessageSocket.loadProjectFromUrl(action.data);
        break;
      case backendActions.GEPPETTO_VERSION:
        onGeppettoVersion(action.data);
        break;
      case backendActions.IMPORT_TYPE_RESOLVED:
        Manager.swapResolvedType(action.data);
        break;
      case backendActions.IMPORT_VALUE_RESOLVED:
        Manager.swapResolvedValue(action.data);
        break; 
      case backendActions.FETCHED:
      case backendActions.VARIABLE_FETCHED:{ 
        Manager.addVariableToModel(action.data);
        break; 
      }
      case backendActions.MODEL_LOADED: {
        console.time(Resources.PARSING_MODEL);
        Manager.loadModel(action.data);
        break;
      }
      case backendActions.PROJECT_LOADED: {

        const message = action.data;
        MessageSocket.projectId = message.project.id;
        Manager.loadProject(message.project, message.persisted);
        break;
      }

      case backendActions.ERROR_DOWNLOADING_MODEL:
      case backendActions.ERROR_DOWNLOADING_RESULTS:
      case backendActions.ERROR_LOADING_PROJECT:
      case backendActions.ERROR_LOADING_SIM:
      case backendActions.ERROR:
        onError(action.data);
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
