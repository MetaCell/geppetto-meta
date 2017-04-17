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
/**
 * Loads and runGeppetto core QUnit tests
 *
 * @author Jesus Martinez (jesus@metacell.us)
 * @author Giovanni (giovanni@metacell.us)
 */

/*
 * Configure RequireJS. Values inside brackets mean those libraries are required prior to loading.
 */
global.jQuery = require("jquery");
var QUnit = require("qunitjs");
var ProjectNode = require('../../../geppettoProject/model/ProjectNode');
var qUnitFile = window.TestConfig.qUnitFile;

jQuery(function () {
    window.GEPPETTO = require('geppetto');
    window.Project = new ProjectNode({name: "Project", id: -1});
    window.G = GEPPETTO.G;
    window.Widgets = GEPPETTO.Widgets;
    window.help = GEPPETTO.Utility.help;

    var QUnitTests = require('./'+qUnitFile);
    QUnitTests.run();

    // sacrifice a goat and start QUnit
    QUnit.load();
    QUnit.start();
});
