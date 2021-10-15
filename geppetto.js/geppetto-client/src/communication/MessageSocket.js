/*
 *
 * WebSocket class use for communication between client and server
 *
 * @author  Jesus R. Martinez (jesus@metacell.us)
 */
import Resources from '@metacell/geppetto-meta-core/Resources';
import EventManager from '@metacell/geppetto-meta-client/common/EventManager';

const connectionInterval = 300;
const pako = require("pako");
const FileSaver = require('file-saver');

const callbackHandler = {};

/**
 * Web socket creation and communication
 */
export class MessageSocket {
  socket = null;
  messageHandlers = [];
  clientID = null;
  nextID = 0;
  // sets protocol to use for connection
  protocol = GEPPETTO_CONFIGURATION.useSsl ? "wss://" : "ws://";

  // flag used to connect using ws protocol if wss failed
  failsafe = false;

  // vars used for reconnection
  attempts = 0;
  host = undefined;
  projectId = undefined;
  lostConnectionId = undefined;
  reconnectionLimit = 10;
  autoReconnectInterval = 5 * 1000;
  socketStatus = Resources.SocketStatus.CLOSE;

  constructor() {
    this.connect = this.connect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.send = this.send.bind(this);
  }

  connect (host) {
    if (this.socket !== null) {
      delete this.socket;
    }
    if ('WebSocket' in window) {
      this.socket = new WebSocket(host);
      this.host = host;
      this.socket.binaryType = "arraybuffer";
    } else if ('MozWebSocket' in window) {
      this.socket = new MozWebSocket(host);
    } else {
      console.log(Resources.WEBSOCKET_NOT_SUPPORTED, true);
      return;
    }

   

    this.socket.onopen = e => {
      console.log(Resources.WEBSOCKET_OPENED, true);

      /*
       * attach the handlers once socket is opened on the first connection
       * differently handle the reconnection scenario
       */
      
      EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](Resources.LOADING_PROJECT);
      const parameters = {};
      parameters["connectionID"] = this.lostConnectionId;
      parameters["projectId"] = this.projectId;
      this.send("reconnect", parameters);
      EventManager.actionsHandler[EventManager.clientActions.HIDE_SPINNER]();
      
      this.lostConnectionId = undefined;

      // Reset the counter for reconnection
      this.attempts = 0;
      this.socketStatus = Resources.SocketStatus.OPEN;
      console.log("%c WebSocket Status - Opened ", 'background: #444; color: #bada55')
    };

    this.socket.onclose = e => {
      switch (e.code) {
      case 1000:
        this.socketStatus = Resources.SocketStatus.CLOSE;
        console.log(Resources.WEBSOCKET_CLOSED, true);
        break;
      default:
        if (this.lostConnectionId === undefined) {
          this.lostConnectionId = this.getClientID();
        }
        this.reconnect(e);
      }
    };

    this.socket.onmessage = msg => {
      const messageData = msg.data;

      if (messageData == "ping") {
        return;
      }

      // if it's a binary (possibly compressed) then determine its type and process it
      if (messageData instanceof ArrayBuffer) {
        processBinaryMessage(messageData);

        // otherwise, for a text message, parse it and notify listeners
      } else {
        // a non compressed message
        parseAndNotify(messageData);
      }

    };

    // Detects problems when connecting to Geppetto server
    this.socket.onerror = e => {
      var message = Resources.SERVER_CONNECTION_ERROR;
      /*
       * Attempt to connect using ws first time wss fails,
       * if ws fails too then don't try again and display info error window
       */
      if (this.failsafe) {
        this.protocol = "ws://";
        this.failsafe = true;
        this.connect(this.protocol + window.location.host + '/' + GEPPETTO_CONFIGURATION.contextPath + '/GeppettoServlet');
      } else {
        switch (e.code) {
        case 'ECONNREFUSED':
          console.log("%c WebSocket Status - Open connection error ", 'background: #000; color: red');
          console.log(Resources.WEBSOCKET_CONNECTION_ERROR, true);
          break;
        case undefined:
          console.log("%c WebSocket Status - Open connection error ", 'background: #000; color: red');
          console.log(Resources.WEBSOCKET_RECONNECTION, true);
          break;
        default:
          console.log("%c WebSocket Status - Closed ", 'background: #000; color: red');
          this.socketStatus = Resources.SocketStatus.CLOSE;
          break;
        }
      }
    }
  }

  /**
   * Attempt to reconnect to the backend
   */
  reconnect (e) {
    if (this.attempts < this.reconnectionLimit) {
      this.attempts++;
      this.socketStatus = Resources.SocketStatus.RECONNECTING;
      console.log(`WebSocket Status - retry in ${this.autoReconnectInterval}ms`, e);
      setTimeout(() => {
        console.log("%c WebSocket Status - reconnecting... ", 'background: #444; color: #bada55');
        this.connect(this.host);
      }, this.autoReconnectInterval);
    } else {
      this.socketStatus = Resources.SocketStatus.CLOSE;
      console.log(Resources.WEBSOCKET_CLOSED, true);
      EventManager.actionsHandler[EventManager.clientActions.WEBSOCKET_DISCONNECTED]();
    }
  }

  /**
   * Sends messages to the server
   */
  send (command, parameter, callback) {
    if (this.socketStatus === Resources.SocketStatus.RECONNECTING && command !== "reconnect") {
      EventManager.actionsHandler[EventManager.clientActions.STOP_LOGO]();
      return;
    }
    var requestID = this.createRequestID();


    this.waitForConnection(messageTemplate(requestID, command, parameter), connectionInterval);

    // add callback with request id if any
    if (callback != undefined) {
      callbackHandler[requestID] = callback;
    }

    return requestID;
  }

  waitForConnection (messageTemplate, interval) {
    if (this.isReady() === 1) {
      this.socket.send(messageTemplate);
    } else if (this.isReady() > 1){
      // connection is either closing (2) or already closed (3).
      EventManager.actionsHandler[EventManager.clientActions.WEBSOCKET_DISCONNECTED]();
    } else {
      // must be in connecting (0) state
      var that = this;
      setTimeout(function () {
        that.waitForConnection(messageTemplate);
      }, interval);
    }
  }

  isReady () {
    if (this.socket !== null) {
      return this.socket.readyState;
    } else {
      return 0;
    }
  }

  close () {
    this.socket.close();
    // dispose of handlers upon closing connection
    this.messageHandlers = [];
    EventManager.actionsHandler[EventManager.clientActions.WEBSOCKET_DISCONNECTED]();

  }

  /**
   * Add handler to receive updates from server
   */
  addHandler (handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * Removes a handler from the socket
   */
  removeHandler (handler) {
    var index = this.messageHandlers.indexOf(handler);

    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * Clear handlers
   */
  clearHandlers () {
    this.messageHandlers = [];
  }


  /**
   * Sets the id of the client
   */
  setClientID (id) {
    this.clientID = id;
  }

  /**
   * Sets the id of the client
   */
  getClientID () {
    return this.clientID;
  }
  /**
   * Creates a request id to send with the message to the server
   */
  createRequestID () {
    return this.clientID + "-" + (this.nextID++);
  }

  loadProjectFromId (projectId) {
    this.send("load_project_from_id", { projectId });
  }
  
  loadProjectFromUrl (projectURL) {
    this.send("load_project_from_url", projectURL);
  }

  loadProjectFromContent (content) {
    this.send("load_project_from_content", content);
  }
}

/**
 * Template for Geppetto message
 *
 * @param msgtype - message type
 * @param payload - message payload, can be anything
 * @returns JSON stringified object
 */
function messageTemplate (id, msgtype, payload) {

  if (!(typeof payload == 'string' || payload instanceof String)) {
    payload = JSON.stringify(payload);
  }

  var object = {
    requestID: id,
    type: msgtype,
    data: payload
  };
  return JSON.stringify(object);
}

function gzipUncompress (compressedMessage) {
  var messageBytes = new Uint8Array(compressedMessage);
  var message = pako.ungzip(messageBytes, { to: "string" });
  return message;
}

function parseAndNotify (messageData) {
  var parsedServerMessage = JSON.parse(messageData);

  // notify all handlers
  for (var i = 0, len = this.messageHandlers.length; i < len; i++) {
    var handler = this.messageHandlers[i];
    if (handler != null || handler != undefined) {
      handler.onMessage(parsedServerMessage);
    }
  }

  // run callback if any
  if (parsedServerMessage.requestID != undefined){
    if (callbackHandler[parsedServerMessage.requestID] != undefined) {
      callbackHandler[parsedServerMessage.requestID](parsedServerMessage.data);
      delete callbackHandler[parsedServerMessage.requestID];
    }
  }

}



function processBinaryMessage (message) {

  var messageBytes = new Uint8Array(message);

  /*
   * if it's a binary message and first byte it's zero then assume it's a compressed json string
   * otherwise is a file and a 'save as' dialog is opened
   */
  if (messageBytes[0] == 0) {
    var message = pako.ungzip(messageBytes.subarray(1), { to: "string" });
    parseAndNotify(message);
  } else {
    var fileNameLength = messageBytes[1];
    var fileName = String.fromCharCode.apply(null, messageBytes.subarray(2, 2 + fileNameLength));
    var blob = new Blob([message]);
    FileSaver.saveAs(blob.slice(2 + fileNameLength), fileName);
  }
}

export default new MessageSocket();
