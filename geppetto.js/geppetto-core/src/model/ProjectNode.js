
/**
 * Client class for Project node.
 *
 * @module model/ProjectNode
 * @author Jesus R. Martinez (jesus@metacell.us)
 */

var EventManager = require('@metacell/geppetto-meta-client/common/EventManager').default

/**
 * @depreacted
 */
define(['backbone'], function (require) {

  return Backbone.Model.extend({
    initializationTime: null,
    name: "",
    id: "",
    persisted: false,
    runTimeTree: {},
    readOnly : true,
    isPublicProject : false,
    view: {},

    /**
     * Initializes this project with passed attributes
     *
     * @param {Object} options - Object with options attributes to initialize
     *                           node
     */
    initialize: function (options) {
      this.runTimeTree = {};
      if (options) {
        this.name = options.name;
        this.id = options.id;
      }
    },

    /**
     * Gets the name of the node
     *
     * @command Node.getName()
     * @returns {String} Name of the node
     *
     */
    getName: function () {
      return this.name;
    },

    /**
     * Sets the name of the node
     *
     * @command Node.setName()
     *
     */
    setName: function (newname) {
      if (this.writePermission && this.persisted){
        this.saveProjectProperties({ "name": newname });
        this.name = newname;
      } else {
        return GEPPETTO.Utility.persistedAndWriteMessage(this);
      }
    },

    /**
     * Get the id associated with node
     *
     * @command Node.getId()
     * @returns {String} ID of node
     */
    getId: function () {
      return this.id;
    },

    /**
     * Loads a project from content.
     *
     * @command Project.loadFromContent(projectID)
     * @param {URL} projectID - Id of project to load
     * @returns {String}  Status of attempt to load simulation using url.
     */
    loadFromID: function (projectID) {
      EventManager.actionsHandler[EventManager.clientActions.PROJECT_LOADING]();
      console.time(GEPPETTO.Resources.LOADING_PROJECT);
      EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.LOADING_PROJECT);

      var loadStatus = GEPPETTO.Resources.LOADING_PROJECT;

      if (projectID != null && projectID != "") {
        var parameters = {};
        parameters["projectId"] = projectID;
        GEPPETTO.MessageSocket.send("load_project_from_id", parameters);
        this.initializationTime = new Date();
        console.log("Message sent : " + this.initializationTime.getTime(), true);
        console.log(GEPPETTO.Resources.MESSAGE_OUTBOUND_LOAD, true);
      } else {
        loadStatus = GEPPETTO.Resources.PROJECT_UNSPECIFIED;
      }

      return loadStatus;
    },

    /**
     * Loads a project from url.
     *
     * @command Project.loadFromContent(projectURL)
     * @param {URL} simulationURL - URL of project to be loaded
     * @returns {String}  Status of attempt to load project using url.
     */
    loadFromURL: function (projectURL) {
      console.time(GEPPETTO.Resources.LOADING_PROJECT);
      EventManager.actionsHandler[EventManager.clientActions.PROJECT_LOADING]();
      EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.LOADING_PROJECT);

      var loadStatus = GEPPETTO.Resources.LOADING_PROJECT;

      if (projectURL != null && projectURL != "") {
        GEPPETTO.MessageSocket.send("load_project_from_url", projectURL);
        this.persisted = false;
        this.initializationTime = new Date();
        console.log("Message sent : " + this.initializationTime.getTime(), true);
        console.log(GEPPETTO.Resources.MESSAGE_OUTBOUND_LOAD, true);
      } else {
        loadStatus = GEPPETTO.Resources.PROJECT_UNSPECIFIED;
      }

      return loadStatus;
    },

    /**
     * Loads a project from content.
     *
     * @command Project.loadFromContent(content)
     * @param {String} content - Content of project to load
     * @returns {String}  Status of attempt to load project
     */
    loadFromContent: function (content) {
      EventManager.actionsHandler[EventManager.clientActions.PROJECT_LOADING]();
      console.time(GEPPETTO.Resources.LOADING_PROJECT);
      EventManager.actionsHandler[EventManager.clientActions.SHOW_SPINNER](GEPPETTO.Resources.LOADING_PROJECT);

      var loadStatus = GEPPETTO.Resources.LOADING_PROJECT;

      if (content != null && content != "") {
        // Updates the simulation controls visibility

        GEPPETTO.MessageSocket.send("load_project_from_content", content);
        this.initializationTime = new Date();
        console.log("Message sent : " + this.initializationTime.getTime(), true);
        console.log(GEPPETTO.Resources.MESSAGE_OUTBOUND_LOAD, true);
        // trigger simulation restart event

      } else {
        loadStatus = GEPPETTO.Resources.PROJECT_UNSPECIFIED;
      }
      return loadStatus;
    },

    saveProjectProperties: function (properties) {
      if (this.writePermission && this.persisted && !this.isReadOnly()){
        var parameters = {};
        parameters["projectId"] = this.getId();
        parameters["properties"] = properties;
        GEPPETTO.MessageSocket.send("save_project_properties", parameters);
      } else {
        return GEPPETTO.Utility.persistedAndWriteMessage(this);
      }
    },

    persist: function () {
      if (this.writePermission){
        var parameters = {};
        parameters["projectId"] = this.id;
        GEPPETTO.MessageSocket.send("persist_project", parameters);
      } else {
        return GEPPETTO.Utility.persistedAndWriteMessage(this);
      }
    },
        
    makePublic : function (mode){
      if (this.writePermission){
        var parameters = {};
        parameters["projectId"] = this.id;
        parameters["isPublic"] = mode;
        GEPPETTO.MessageSocket.send("make_project_public", parameters);
      } else {
        return GEPPETTO.Utility.persistedAndWriteMessage(this);
      }
    },
        
    isPublic : function (){
      return this.isPublicProject;
    },
        
    isReadOnly : function (){
      return this.readOnly;
    },

    /**
     * Download model for this project.
     *
     * @command ProjectNode.downloadModel(format)
     * * @param {String} name - File format to download
     */
    downloadModel : function (path, format) {
      if (this.downloadPermission){
        var parameters = {};
        parameters["projectId"] = this.getId();
        parameters["instancePath"] = path;
        parameters["format"] = format;
        GEPPETTO.MessageSocket.send("download_model", parameters);

        var formatMessage = (format == "") ? "default format" : format;
        return GEPPETTO.Resources.DOWNLOADING_MODEL + formatMessage;
      } else {
        message = GEPPETTO.Resources.OPERATION_NOT_SUPPORTED + GEPPETTO.Resources.DOWNLOAD_PRIVILEGES_NOT_SUPPORTED;
        GEPPETTO.ModalFactory.infoDialog(GEPPETTO.Resources.ERROR, message);
        return message;
      }
    },

    /**
     * Set project view
     *
     * @param view
     */
    setView: function (view){
      this.set('view', JSON.stringify(view));
    },

    /**
     * Gets project view
     *
     * @returns {exports.view|{}}
     */
    getView: function (){
      var viewsString = this.get('view');
      var views = undefined;

      if (viewsString != undefined){
        views = JSON.parse(viewsString);
      }
      return views;
    },

    /**
     * * Download this project.
     *
     * @command ProjectNode.downloadModel(format)
     * * @param {String} name - File format to download
     */
    download : function (path, format) {
      var parameters = {};
      parameters["projectId"] = this.getId();
      GEPPETTO.MessageSocket.send("download_project", parameters);

      return GEPPETTO.Resources.DOWNLOADING_PROJECT;
    },
        
    /**
     * Print out formatted node
     */
    print: function () {
      return "Name : " + this.name + "\n" + "    Id: " + this.id + "\n"
                + "    InstancePath : " + this.instancePath + "\n";
    }
  });
});
