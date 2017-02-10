/*******************************************************************************
 *
 * Copyright (c) 2011, 2016 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
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

define(function (require) {

    var React = require('react');

    var RunButton = require('./buttons/RunButton');
    var PlayButton = require('./buttons/PlayButton');
    var PauseButton = require('./buttons/PauseButton');
    var StopButton = require('./buttons/StopButton');
    var HelpButton = require('./buttons/HelpButton');

    var GEPPETTO = require('geppetto');

    var SimulationControls = React.createClass({

        getInitialState: function () {
            return {
                disableRun: true,
                disablePlay: true,
                disablePause: true,
                disableStop: true
            }
        },

        getDefaultProps: function() {
            return {
                hideHelp: false,
                hideRun: false,
                hidePlay: false,
                hidePause: false,
                hideStop: false
            };
        },

        permissions : function(){
        	var experiment = window.Project.getActiveExperiment();
            var writePermission = GEPPETTO.UserController.hasPermission(GEPPETTO.Resources.WRITE_PROJECT);
            var runPermission = GEPPETTO.UserController.hasPermission(GEPPETTO.Resources.RUN_EXPERIMENT);
            var projectPersisted = experiment.getParent().persisted;
            var login = GEPPETTO.UserController.isLoggedIn() && GEPPETTO.UserController.hasPersistence();
            var readOnlyProject = window.Project.isReadOnly();
            
            if(writePermission && runPermission && projectPersisted && login && !readOnlyProject){
            	return true;
            }
            
            return false;
        },
        
        componentDidMount: function () {
            var self = this;

            GEPPETTO.on(Events.Experiment_loaded, function () {
            	self.updateStatus();
            });
            
            GEPPETTO.on(Events.Project_persisted, function () {
            	self.updateStatus();
            });
            
            GEPPETTO.on(Events.Project_loaded, function () {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_running, function () {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_failed, function (id) {
            	var activeExperiment = window.Project.getActiveExperiment();
            	if(activeExperiment!=null || undefined){
            		if(activeExperiment.getId()==id){
                        self.setState({disableRun: false, disablePlay: true, disablePause: true, disableStop: true});
            		}
            	}
            });
            
            GEPPETTO.on(Events.Experiment_completed, function () {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_play, function (options) {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_resume, function () {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_pause, function () {
            	self.updateStatus();
            });

            GEPPETTO.on(Events.Experiment_stop, function (options) {
            	self.updateStatus();
            });
            
            GEPPETTO.on(Events.Experiment_deleted, function () {
            	var experiment = window.Project.getActiveExperiment();
            	if(experiment ==null || undefined){
            		self.setState({disableRun: true, disablePlay: true, disablePause: true, disableStop: true});
            	}
            });

            
            GEPPETTO.on('disable_all', function () {
                self.setState({disableRun: true, disablePlay: true, disablePause: true, disableStop: true});
            });

            GEPPETTO.on(Events.Experiment_over, function () {
            	self.updateStatus();
            });
            
            this.updateStatus();
        },
        
        updateStatus:function(){
        	var experiment = window.Project.getActiveExperiment();
            
            if(experiment!=null || undefined){
            	if (experiment.getStatus() == GEPPETTO.Resources.ExperimentStatus.COMPLETED) {
            		if(GEPPETTO.ExperimentsController.isPaused()){
            			this.setState({disableRun: true, disablePlay: false, disablePause: true, disableStop: false});
            		}
            		else if(GEPPETTO.ExperimentsController.isPlaying()){
            			this.setState({disableRun: true, disablePlay: true, disablePause: false, disableStop: false});
            		}
            		else if(GEPPETTO.ExperimentsController.isStopped()){
            			this.setState({disableRun: true, disablePlay: false, disablePause: true, disableStop: true});
            		}
            	}
            	else if (experiment.getStatus() == GEPPETTO.Resources.ExperimentStatus.RUNNING) {
            		this.setState({disableRun: true, disablePlay: true, disablePause: true, disableStop: true});
            	}
            	else if (experiment.getStatus() == GEPPETTO.Resources.ExperimentStatus.ERROR) {
            		if(this.permissions()){
            			this.setState({disableRun: false, disablePlay: true, disablePause: true, disableStop: true});
            		}else{
            			this.setState({disableRun: true, disablePlay: true, disablePause: true, disableStop: true});
            		}
            	}
            	else if (experiment.getStatus() == GEPPETTO.Resources.ExperimentStatus.DESIGN) {
            		if(this.permissions()){
            			this.setState({disableRun: false, disablePlay: true, disablePause: true, disableStop: true});
            		}else{
            			this.setState({disableRun: true, disablePlay: true, disablePause: true, disableStop: true});
            		}
            	}
            }
        },

        render: function () {
            return React.DOM.div({className: 'simulation-controls'},
                React.createFactory(HelpButton)({disabled: false, hidden: this.props.hideHelp}),
                React.createFactory(StopButton)({disabled: this.state.disableStop, hidden: this.props.hideStop}),
                React.createFactory(PauseButton)({disabled: this.state.disablePause, hidden: this.props.hidePause}),
                React.createFactory(PlayButton)({disabled: this.state.disablePlay, hidden: this.props.hidePlay}),
                React.createFactory(RunButton)({disabled: this.state.disableRun, hidden: this.props.hideRun})
            );
        }

    });

    return SimulationControls;
});
