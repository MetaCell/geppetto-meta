
import { urljoin } from 'url-join';

import MessageSocket from './communication/MessageSocket';
import Events from './Events';
/**
 * Geppetto entry point
 *
 * @author matteo@openworm.org (Matteo Cantarelli)
 * @author giovanni@openworm.org (Giovanni Idili)
 * @author  Jesus R. Martinez (jesus@metacell.us)
 * @deprecated
 */
    
    
const Main = {

  idleTime: 0,
  disconnected: false,
  statusWorker: null,
  localStorageEnabled: false,

  /**
   *
   */
  createChannel: function () {
    // Change link from blank to self for GEPPETTO_CONFIGURATION.embedded environments
    if (GEPPETTO_CONFIGURATION.embedded && GEPPETTO_CONFIGURATION.embedderURL !== "/" && typeof handleRequest == 'undefined') {
      handleRequest = function (e) {
        if (GEPPETTO_CONFIGURATION.embedderURL.indexOf(e.origin) != -1) {
          if (e.data.command == 'loadSimulation') {
            if (e.data.projectId) {
              Project.loadFromID(e.data.projectId);
            } else if (e.data.url) {
              Project.loadFromURL(e.data.url);
            }
          } else if (e.data.command == 'removeWidgets') {
            G.removeWidget();
          } else {
            eval(e.data.command);
          }
        }
      };
      // we have to listen for 'message'
      window.addEventListener('message', handleRequest, false);
      if ($.isArray(GEPPETTO_CONFIGURATION.embedderURL)) {
        window.parent.postMessage({ "command": "ready" }, GEPPETTO_CONFIGURATION.embedderURL[0]);
      } else {
        window.parent.postMessage({ "command": "ready" }, GEPPETTO_CONFIGURATION.embedderURL);
      }
    }
  },

  /**
   * Initialize web socket communication
   */
  init: function () {
    if (GEPPETTO_CONFIGURATION.contextPath == "/"){
      var host = urljoin(MessageSocket.protocol + window.location.host.replace("8081","8080"), '/GeppettoServlet');
    } else {
      var baseHost = MessageSocket.protocol + window.location.host;
      var contextPath = window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/"));
      if (!contextPath.endsWith(GEPPETTO_CONFIGURATION.contextPath.replace(/^\/|\/$/g, ''))){
        contextPath = urljoin(contextPath, GEPPETTO_CONFIGURATION.contextPath);
      }
      var host = urljoin(baseHost, contextPath , "GeppettoServlet")
    }
    MessageSocket.connect(host);
    console.log("Host for MessageSocket to connect: " + host);
    Events.listen();
    this.createChannel();
    MessageSocket.send("geppetto_version", null);
  },


  /**
   * Idle check
   */
  idleCheck: function () {}
};
export default Main;