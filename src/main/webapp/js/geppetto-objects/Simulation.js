/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *     	OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/

/**
 * 
 * Class for the Simulation Object. Handles user's request to start, stop, pause, 
 * and/or load a simulation.
 * 
 * @constructor
 * 
 * @author matteo@openworm.org (Matteo Cantarelli)
 * @author giovanni@openworm.org (Giovanni Idili)
 * @author  Jesus R. Martinez (jesus@metacell.us)
 */
var Simulation = Simulation ||
{
	REVISION : '1'
};

Simulation.StatusEnum =
{
	INIT : 0,
	LOADED : 1,
	STARTED : 2,
	PAUSED : 3,
	STOPPED: 4
};

Simulation.status = Simulation.StatusEnum.INIT;

Simulation.simulationURL = "";

var loading = false;

/**
 * Start the simulation.
 * 
 * @name Simulation.start()
 * @returns {String} - Simulation status after starting it.
 */
Simulation.start = function()
{
	if(Simulation.isLoaded()){		
		GEPPETTO.MessageSocket.send("start", null);
		
		Simulation.status = Simulation.StatusEnum.STARTED;
		GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_START);
		
		return SIMULATION_STARTED;
	}
	else{
		return UNABLE_TO_START_SIMULATION;
	}
};

/**
 * Pauses the simulation
 * 
 * @name Simulation.pause()
 * @returns {String} - Status of Simulation after pausing it.
 * 
 */
Simulation.pause = function()
{
	if(Simulation.status == Simulation.StatusEnum.STARTED){
		//Updates the simulation controls visibility
		GEPPETTO.FE.updatePauseEvent();
		
		GEPPETTO.MessageSocket.send("pause", null);
		
		Simulation.status = Simulation.StatusEnum.PAUSED;
		GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_PAUSE);

		return SIMULATION_PAUSED;
	}
	else{
		return UNABLE_TO_PAUSE_SIMULATION;
	}
};

/**
 * Stops the simulation. 
 * 
 * @name Simulation.stop()
 * @returns {String} - Status of simulation after stopping it.
 */
Simulation.stop = function()
{
	if(Simulation.status == Simulation.StatusEnum.PAUSED || Simulation.status == Simulation.StatusEnum.STARTED){
		//Updates the simulation controls visibility
		GEPPETTO.FE.updateStopEvent();

		GEPPETTO.MessageSocket.send("stop", null);
		
		Simulation.status = Simulation.StatusEnum.STOPPED;
		GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_STOP);

		return SIMULATION_STOP;
	}
	else if(Simulation.status == Simulation.StatusEnum.LOADED){
		return SIMULATION_NOT_RUNNING;
	}
	else if(Simulation.status == Simulation.StatusEnum.STOPPED){
		return SIMULATION_ALREADY_STOPPED;
	}
	else{
		return SIMULATION_NOT_LOADED;
	}
};

/**
 * Loads a simulation from a URL.
 * 
 * @name Simulation.load(simulationURL)
 * @param simulationURL - URL of simulation file to be loaded.
 * @returns {String} - Status of attempt to load simulation using url. 
 */
Simulation.load = function(simulationURL)
{
	if (Simulation.status == Simulation.StatusEnum.STARTED || Simulation.status == Simulation.StatusEnum.PAUSED)
	{
		Simulation.stop();
	}
		
	Simulation.simulationURL = simulationURL;
	
	var loadStatus = LOADING_SIMULATION;
	
	if(simulationURL != null && simulationURL != ""){
		//Updates the simulation controls visibility
		var webGLStarted = GEPPETTO.init(GEPPETTO.FE.createContainer());
		//update ui based on success of webgl
		GEPPETTO.FE.update(webGLStarted);
		//Keep going with load of simulation only if webgl container was created
		if(webGLStarted){
			GEPPETTO.FE.activateLoader("show", LOADING_SIMULATION);
			if (Simulation.status == Simulation.StatusEnum.INIT)
			{
				//we call it only the first time
				GEPPETTO.animate();
			}
			GEPPETTO.MessageSocket.send("init_url", simulationURL);
			loading = true;
			GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_LOAD);			
		}
	}
	
	else{		
		loadStatus = SIMULATION_UNSPECIFIED;
	}
	
	return loadStatus;
};

/**
 * Loads a simulation using the content's from the simulation file editor.
 * 
 * @name Simulation.loadFromContent(content)
 * @param content - Content of simulation to be loaded. 
 * @returns {String} - Status of attempt to load simulation from content window.
 */
Simulation.loadFromContent = function(content)
{
	 if (Simulation.status == Simulation.StatusEnum.STARTED || Simulation.status == Simulation.StatusEnum.PAUSED)
	 {
		 Simulation.stop();
	 }

	var webGLStarted = GEPPETTO.init(GEPPETTO.FE.createContainer());
	//update ui based on success of webgl
	GEPPETTO.FE.update(webGLStarted);
	//Keep going with load of simulation only if webgl container was created
	if(webGLStarted){
		GEPPETTO.FE.activateLoader("show", LOADING_SIMULATION);
		if (Simulation.status == Simulation.StatusEnum.INIT)
		{
			//we call it only the first time
			GEPPETTO.animate();
		}
		
		GEPPETTO.MessageSocket.send("init_sim", content);
		loading = true;
		GEPPETTO.Console.debugLog(LOADING_FROM_CONTENT);
	}
	
	return LOADING_SIMULATION;
};

/**
 * Checks status of the simulation, whether it has been loaded or not.
 * 
 * @name Simulation.isLoaded()
 * @returns {Boolean} - True if simulation has been loaded, false if not.
 */
Simulation.isLoaded = function()
{
	if(Simulation.status != Simulation.StatusEnum.INIT){
		return true;
	}
	
	return false;
};

Simulation.isLoading = function()
{
	return loading;
};

/**
 * LIst watchable variables for the simulation.
 * 
 * @name Simulation.listWatchableVariables()
 * @returns {String} - status after requesting list of watchable variables.
 */
Simulation.listWatchableVariables = function()
{
	if(Simulation.isLoaded()){		
		GEPPETTO.MessageSocket.socket.send(messageTemplate("list_watch_vars", null));
		
		GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_LIST_WATCH);
		
		return SIMULATION_VARS_LIST;
	}
	else{
		return SIMULATION_NOT_LOADED_LIST;
	}
};

/**
 * List forceable variables for the simulation.
 * 
 * @name Simulation.listForceableVariables()
 * @returns {String} - status after requesting list of forceable variables.
 */
Simulation.listForceableVariables = function()
{
	if(Simulation.isLoaded()){		
		GEPPETTO.MessageSocket.socket.send(messageTemplate("list_force_vars", null));
		
		GEPPETTO.Console.debugLog(MESSAGE_OUTBOUND_LIST_FORCE);
		
		return SIMULATION_VARS_LIST;
	}
	else{
		return SIMULATION_NOT_LOADED_LIST;
	}
};

/**
 *
 * Outputs list of commands with descriptions associated with the Simulation object.
 * 
 * @name Simulation.help()
 * @returns  Returns list of all commands for the Simulation object
 */
Simulation.help = function(){
	return extractCommandsFromFile("js/geppetto-objects/Simulation.js", Simulation, "Simulation");
};

/**
 * Return status of simulation
 */
function getSimulationStatus()
{
	return Simulation.status;
};

function setSimulationLoaded()
{
	Simulation.status = Simulation.StatusEnum.LOADED;
	loading = false;
};

