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

    /**
     * Closes socket and clears handlers. Method is called from each test.
     */
    function launch() {
        //close socket
        GEPPETTO.MessageSocket.close();
        //clear message handlers, all tests within module should have performed by time method it's called
        GEPPETTO.MessageSocket.clearHandlers();
        //connect to socket again for next test
        GEPPETTO.MessageSocket.connect(GEPPETTO.MessageSocket.protocol + window.location.host + '/' + window.BUNDLE_CONTEXT_PATH + '/GeppettoServlet');
    }

    var run = function () {

        QUnit.module("Test Project 1 - SingleCompononetHH");
        QUnit.test("Test Project 1 - SingleComponentHH", function ( assert ) {

            var done = assert.async();

            var handler = {
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        //Simulation has been loaded and model need to be loaded
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));
                            assert.equal(window.Project.getId(), 1, "Project ID checked");
                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.MODEL_LOADED:
                            GEPPETTO.SimulationHandler.loadModel(JSON.parse(parsedServerMessage.data));

                            // test that geppetto model high level is as expected
                            assert.ok(window.Model != undefined, "Model is not undefined");
                            assert.ok(window.Model.getVariables() != undefined && window.Model.getVariables().length == 2 &&
                                      window.Model.getVariables()[0].getId() == 'hhcell' && window.Model.getVariables()[1].getId() == 'time',  "2 Variables as expected");
                            assert.ok(window.Model.getLibraries() != undefined && window.Model.getLibraries().length == 2, "2 Libraries as expected");
                            // test that instance tree high level is as expected
                            assert.ok(window.Instances != undefined && window.Instances.length == 1 && window.Instances[0].getId() == 'hhcell', "1 top level instance as expected");

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);
                            assert.equal(window.Project.getActiveExperiment().getId(), 1, "Active experiment id of loaded project checked");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };
            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            window.Project.loadFromID("1", "1");
        });

        QUnit.module("Test Play Experiment");
        QUnit.test("Load Project 1 - SingleComponentHH", function ( assert ) {

            var done = assert.async();

            var handler = {
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        //Simulation has been loaded and model need to be loaded
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));
                            equal(window.Project.getId(), 1, "Project ID checked");
                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.MODEL_LOADED:
                            GEPPETTO.SimulationHandler.loadModel(JSON.parse(parsedServerMessage.data));

                            // test that geppetto model high level is as expected
                            assert.ok(window.Model != undefined, "Model is not undefined");
                            assert.ok(window.Model.getVariables() != undefined && window.Model.getVariables().length == 2 &&
                                window.Model.getVariables()[0].getId() == 'hhcell' && window.Model.getVariables()[1].getId() == 'time',  "2 Variables as expected");
                            assert.ok(window.Model.getLibraries() != undefined && window.Model.getLibraries().length == 2, "2 Libraries as expected");
                            // test that instance tree high level is as expected
                            assert.ok(window.Instances != undefined && window.Instances.length == 1 && window.Instances[0].getId() == 'hhcell', "1 top level instance as expected");

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);
                            // if experiment isn't completed don't play
                            if (Project.getActiveExperiment().getStatus() != GEPPETTO.Resources.ExperimentStatus.COMPLETED) {
                                assert.ok(false, "Unable to play experiment for project");

                                done();
                                launch();
                            } else {
                                Project.getActiveExperiment().play();
                            }
                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PLAY_EXPERIMENT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var timeSeries = hhcell.hhpop[0].bioPhys1.membraneProperties.naChans.na.h.q.getTimeSeries();
                            assert.equal(timeSeries, null, "Checking that time series is still null in variable");

                            var experimentState = JSON.parse(payload.update);
                            var experiment = window.Project.getActiveExperiment();
                            GEPPETTO.ExperimentsController.updateExperiment(experiment, experimentState);

                            timeSeries = hhcell.hhpop[0].bioPhys1.membraneProperties.naChans.na.h.q.getTimeSeries();
                            assert.equal(timeSeries.length, 6001, "Checking updated time series in variable");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };

            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            window.Project.loadFromID("1", "1");
        });

        QUnit.module("Test C.elegans PVDR Neuron morphology");
        QUnit.test("Tests C.elegans PVDR Neuron morphology", function ( assert ) {

            var done = assert.async();

            var initializationTime;
            var handler = {
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));

                            assert.equal(window.Project.getExperiments().length, 1, "Initial amount of experiments checked");
                            assert.equal(window.Project.getId(), 8, "Project loaded ID checked");
                            window.Project.getExperiments()[0].setActive();

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.MODEL_LOADED:
                            GEPPETTO.SimulationHandler.loadModel(JSON.parse(parsedServerMessage.data));

                            // test that geppetto model high level is as expected
                            assert.ok(window.Model != undefined, "Model is not undefined");
                            assert.ok(window.Model.getVariables() != undefined && window.Model.getVariables().length == 2 &&
                                window.Model.getVariables()[0].getId() == 'pvdr' && window.Model.getVariables()[1].getId() == 'time',  "2 Variables as expected");
                            assert.ok(window.Model.getLibraries() != undefined && window.Model.getLibraries().length == 2, "2 Libraries as expected");
                            // test that instance tree high level is as expected
                            assert.ok(window.Instances != undefined && window.Instances.length == 1 && window.Instances[0].getId() == 'pvdr', "1 top level instance as expected");

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);

                            assert.equal(window.Project.getActiveExperiment().getId(), 1,"Experiment id of loaded project chekced");

                            var passTimeTest = false;
                            if (time < 10) {
                                passTimeTest = true;
                            }

                            assert.equal(passTimeTest, true, "Testing Simulation load time: " + time + " ms");
                            assert.notEqual(pvdr, null, "Entities checked");
                            assert.equal(pvdr.getConnections().length, 0, "Connections checked");
                            assert.equal(pvdr.getVisualGroups().length, 1, "Test number of VisualGroups");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };

            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            initializationTime = new Date();
            window.Project.loadFromID("8", "1");
        });

        QUnit.module("Test Primary Auditory Cortex Network (ACNET2)");
        QUnit.test("Tests Primary Auditory Cortex Network", function ( assert ) {

            var done = assert.async();

            var initializationTime;
            var handler = {
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));

                            assert.equal(window.Project.getExperiments().length, 1, "Initial amount of experimetns checked");
                            assert.equal(window.Project.getId(), 5, "Project loaded ID checked");
                            window.Project.getExperiments()[0].setActive();

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.MODEL_LOADED:
                            GEPPETTO.SimulationHandler.loadModel(JSON.parse(parsedServerMessage.data));

                            // test that geppetto model high level is as expected
                            assert.ok(window.Model != undefined, "Model is not undefined");
                            assert.ok(window.Model.getVariables() != undefined && window.Model.getVariables().length == 2 &&
                                window.Model.getVariables()[0].getId() == 'acnet2' && window.Model.getVariables()[1].getId() == 'time',  "2 Variables as expected");
                            assert.ok(window.Model.getLibraries() != undefined && window.Model.getLibraries().length == 2, "2 Libraries as expected");
                            // test that instance tree high level is as expected
                            assert.ok(window.Instances != undefined && window.Instances.length == 1 && window.Instances[0].getId() == 'acnet2', "1 top level instance as expected");

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);

                            assert.equal(window.Project.getActiveExperiment().getId(), 1, "Experiment id of loaded project chekced");

                            var passTimeTest = false;
                            if (time < 10) {
                                passTimeTest = true;
                            }

                            assert.equal(passTimeTest, true, "Testing Simulation load time: " + time + " ms");
                            assert.notEqual(acnet2, null, "Entities checked");
                            assert.equal(acnet2.getAspects().length, 1, "Aspects checked");
                            assert.equal(acnet2.baskets_12_9.getConnections().length, 60, "Connections checked");
                            assert.equal(jQuery.isEmptyObject(acnet2.electrical.VisualizationTree), false, "Test Visualization at load");
                            assert.equal(acnet2.electrical.VisualizationTree.getChildren().length, 1, "Test Visual Groups amount");
                            assert.equal(jQuery.isEmptyObject(acnet2.electrical.ModelTree), false, "Test Model tree at load");
                            assert.equal(jQuery.isEmptyObject(acnet2.electrical.SimulationTree), false, "Test Simulation tree at load");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };

            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            window.Project.loadFromID("5", "1");
            initializationTime = new Date();
        });

        QUnit.module("Test C302 Simulation");
        QUnit.test("Test C302 Network", function ( assert ) {

            var done = assert.async();

            var initializationTime;
            var handler = {
                checkUpdate2: false,
                startRequestID: null,
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));

                            assert.equal(window.Project.getExperiments().length, 1, "Initial amount of experimetns checked");
                            assert.equal(window.Project.getId(), 6, "Project loaded ID checked");

                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);

                            assert.equal(window.Project.getActiveExperiment().getId(), 1, "Experiment id of loaded project chekced");

                            var passTimeTest = false;
                            if (time < 10) {
                                passTimeTest = true;
                            }

                            assert.equal(passTimeTest, true, "Simulation loaded within time limit: " + time);
                            assert.notEqual(c302, null, "Entities checked");
                            assert.equal(c302.getChildren().length, 300, "C302 Children checked");
                            assert.equal(c302.getAspects().length, 1, "Aspects checked");
                            assert.equal(jQuery.isEmptyObject(c302.electrical.VisualizationTree), false, "Test Visualization at load");
                            assert.equal(jQuery.isEmptyObject(c302.electrical.ModelTree), false, "Test Model tree at load");
                            assert.equal(jQuery.isEmptyObject(c302.electrical.SimulationTree), false, "Test Simulation tree at load");
                            assert.equal(c302.ADAL_0.getConnections().length, 31, "ADAL_0 connections check");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };

            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            initializationTime = new Date();
            window.Project.loadFromID("6", "1");
        });

        QUnit.module("Test Muscle cell NEURON simulation");
        QUnit.test("Tests PMuscle cell NEURON simulation", function ( assert ) {

            var done = assert.async();

            var initializationTime;
            var handler = {
                onMessage: function (parsedServerMessage) {
                    // Switch based on parsed incoming message type
                    switch (parsedServerMessage.type) {
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.PROJECT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            GEPPETTO.SimulationHandler.loadProject(JSON.parse(parsedServerMessage.data));

                            assert.equal(window.Project.getExperiments().length, 1, "Initial amount of experimetns checked");
                            assert.equal(window.Project.getId(), 4, "Project loaded ID checked");
                            break;
                        case GEPPETTO.SimulationHandler.MESSAGE_TYPE.EXPERIMENT_LOADED:
                            var time = (new Date() - initializationTime) / 1000;
                            var payload = JSON.parse(parsedServerMessage.data);
                            GEPPETTO.SimulationHandler.loadExperiment(payload);

                            assert.equal(window.Project.getActiveExperiment().getId(), 1, "Experiment id of loaded project chekced");

                            var passTimeTest = false;
                            if (time < 10) {
                                passTimeTest = true;
                            }

                            assert.equal(passTimeTest, true, "Testing Simulation load time: " + time + " ms");
                            assert.notEqual(net1, null, "Entities checked");
                            assert.equal(net1.getAspects().length, 1, "Aspects checked");
                            assert.equal(net1.getConnections().length, 0, "Connections checked");
                            assert.equal(jQuery.isEmptyObject(net1.neuron_0.electrical.VisualizationTree), false, "Test Visualization at load");
                            assert.equal(net1.neuron_0.electrical.VisualizationTree.getChildren().length, 1, "Test Visual Groups amount");
                            assert.equal(jQuery.isEmptyObject(net1.neuron_0.electrical.ModelTree), false, "Test Model tree at load");
                            assert.equal(jQuery.isEmptyObject(net1.neuron_0.electrical.SimulationTree), false, "Test Simulation tree at load");

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.INFO_MESSAGE:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message);
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = JSON.parse(payload.message).message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                        case GEPPETTO.GlobalHandler.MESSAGE_TYPE.ERROR_LOADING_PROJECT:
                            var payload = JSON.parse(parsedServerMessage.data);
                            var message = payload.message;
                            assert.ok(false, message);

                            done();
                            launch();
                            break;
                    }
                }
            };

            GEPPETTO.MessageSocket.clearHandlers();
            GEPPETTO.MessageSocket.addHandler(handler);
            window.Project.loadFromID("4", "1");
            initializationTime = new Date();
        });
    };
    return {run: run};
});
