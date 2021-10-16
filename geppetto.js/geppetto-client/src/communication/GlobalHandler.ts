/**
 * Handles general incoming messages, excluding Simulation
 */

import EventManager from '../common/EventManager';
import { MessageSocket } from './MessageSocket';
import Resources from '@metacell/geppetto-meta-core/Resources';

var messageTypes = {
  CLIENT_ID: "client_id",
  ERROR_LOADING_SIM: "error_loading_simulation",
  ERROR_LOADING_PROJECT: "error_loading_project",
  ERROR_DOWNLOADING_MODEL: "error_downloading_model",
  ERROR_DOWNLOADING_RESULTS: "error_downloading_results",
  ERROR: "generic_error",
  INFO_MESSAGE: "info_message",
  GEPPETTO_VERSION: "geppetto_version",
  RECONNECTION_ERROR: "reconnection_error",
  USER_PRIVILEGES: "user_privileges",
  
};

class GlobalHandler {
  messageSocket: MessageSocket;
  constructor(messageSocket: MessageSocket) {
    this.messageSocket = messageSocket;
  }


  onClientId(payload) {
    this.messageSocket.setClientID(payload.clientID);
  }

  onError(payload) {
    EventManager.geppettoError(payload.message);
  }

  onreconnectionError() {
    this.messageSocket.socketStatus = Resources.SocketStatus.CLOSE;
    EventManager.websocketDisconnected();
  }

  onInfoMessage(payload) {
    const message = JSON.parse(payload.message);
    EventManager.geppettoInfo(message);
  }

  onGeppettoVersion(payload) {
    const version = payload.geppetto_version;
    const geppettoVersion = Resources.GEPPETTO_VERSION_HOLDER.replace("$1", version);
    console.log(geppettoVersion);
  }


  onMessage(parsedServerMessage) {
    
    const payload = JSON.parse(parsedServerMessage.data);
    console.debug("Received websocket message", payload);
    switch (parsedServerMessage.type) {
      case messageTypes.CLIENT_ID:
        this.onClientId(payload);
        break;
      case messageTypes.RECONNECTION_ERROR:
        this.onreconnectionError();
        break;
      case messageTypes.INFO_MESSAGE:
        this.onInfoMessage(payload);
        break;
      case messageTypes.GEPPETTO_VERSION:
        this.onGeppettoVersion(payload);
        break;

      case messageTypes.ERROR_DOWNLOADING_MODEL:
      case messageTypes.ERROR_DOWNLOADING_RESULTS:
      case messageTypes.ERROR_LOADING_PROJECT:
      case messageTypes.ERROR_LOADING_SIM:
      case messageTypes.ERROR:
        this.onError(payload);
        break;
      default:
        break;
    }
  }


}

// Compatibility with new imports and old require syntax
export default GlobalHandler;
