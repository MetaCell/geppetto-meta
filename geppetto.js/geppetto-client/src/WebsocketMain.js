/**
 * Geppetto entry point
 *
 */

import urljoin from 'url-join';

import MessageSocket from './communication/MessageSocket';

import Events from './Events';

/**
 *
 */
function createChannel() {
  // Change link from blank to self for GEPPETTO_CONFIGURATION.embedded environments
  if (GEPPETTO_CONFIGURATION.embedded && GEPPETTO_CONFIGURATION.embedderURL !== "/" && typeof handleRequest == 'undefined') {
    if ($.isArray(GEPPETTO_CONFIGURATION.embedderURL)) {
      window.parent.postMessage({ "command": "ready" }, GEPPETTO_CONFIGURATION.embedderURL[0]);
    } else {
      window.parent.postMessage({ "command": "ready" }, GEPPETTO_CONFIGURATION.embedderURL);
    }
  }
}

/**
 * Initialize web socket communication
 */
export function init() {
  if (GEPPETTO_CONFIGURATION.contextPath == "/") {
    var host = urljoin(MessageSocket.protocol + window.location.host.replace("8081", "8080"), '/GeppettoServlet');
  } else {
    var baseHost = MessageSocket.protocol + window.location.host;
    var contextPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
    if (!contextPath.endsWith(GEPPETTO_CONFIGURATION.contextPath.replace(/^\/|\/$/g, ''))) {
      contextPath = urljoin(contextPath, GEPPETTO_CONFIGURATION.contextPath);
    }
    var host = urljoin(baseHost, contextPath, "GeppettoServlet")
  }
  MessageSocket.connect(host);
  console.log("Host for MessageSocket to connect: " + host);
  Events.listen();
  createChannel();
  MessageSocket.send("geppetto_version", null);
}


export default { init };
