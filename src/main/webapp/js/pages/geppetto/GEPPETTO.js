/**
 *
 * @author matteo@openworm.org (Matteo Cantarelli)
 * @authot Jesus R Martinez (jesus@metacell.us)
 */
define(function (require) {

    var $ = require('jquery'), _ = require('underscore'), Backbone = require('backbone');

    //These two libraries are required here so that Geppetto can work properly in an iframe (as embedded website).
    //Otherwise, sometimes (randomly)  these libraries are not loaded on time and some js commands failed and the web is not loaded properly.
    require('jquery-ui');
    require('bootstrap');


    var isWebglEnabled = require('detector-webgl');

    var THREE = require('three');
    require('../../components/interface/3dCanvas/TrackballControls');
    require('../../components/interface/3dCanvas/OBJLoader');
    var THREEx = require('../../components/interface/3dCanvas/THREEx.KeyboardState');
    THREE.ColladaLoader = require('imports?THREE=three!exports?THREE.ColladaLoader!../../../node_modules\/three\/examples\/js\/loaders\/ColladaLoader');
    THREE.ConvolutionShader = require('imports?THREE=three!exports?THREE.ConvolutionShader!../../../node_modules\/three\/examples\/js\/shaders\/ConvolutionShader');
    THREE.CopyShader = require('imports?THREE=three!exports?THREE.CopyShader!../../../node_modules\/three\/examples\/js\/shaders\/CopyShader');
    THREE.FilmShader = require('imports?THREE=three!exports?THREE.FilmShader!../../../node_modules\/three\/examples\/js\/shaders\/FilmShader');
    THREE.FocusShader = require('imports?THREE=three!exports?THREE.FocusShader!../../../node_modules\/three\/examples\/js\/shaders\/FocusShader');
    THREE.EffectComposer = require('imports?THREE=three!exports?THREE.EffectComposer!../../../node_modules\/three\/examples\/js\/postprocessing\/EffectComposer');
    THREE.MaskPass = require('imports?THREE=three!exports?THREE.MaskPass!../../../node_modules\/three\/examples\/js\/postprocessing\/MaskPass');
    THREE.RenderPass = require('imports?THREE=three!exports?THREE.RenderPass!../../../node_modules\/three\/examples\/js\/postprocessing\/RenderPass');
    THREE.BloomPass = require('imports?THREE=three!exports?THREE.BloomPass!../../../node_modules\/three\/examples\/js\/postprocessing\/BloomPass');
    THREE.ShaderPass = require('imports?THREE=three!exports?THREE.ShaderPass!../../../node_modules\/three\/examples\/js\/postprocessing\/ShaderPass');
    THREE.FilmPass = require('imports?THREE=three!exports?THREE.FilmPass!../../../node_modules\/three\/examples\/js\/postprocessing\/FilmPass');
    var Stats = require('stats.js');

    var step = 0;

    var VARS = {
        debug: false,
        camera: null,
        container: null,
        controls: null,
        scene: null,
        meshes: {},
        splitMeshes: {},
        connectionLines: {},
        renderer: null,
        clock: new THREE.Clock(),
        stats: null,
        gui: null,
        projector: null,
        keyboard: new THREEx.KeyboardState(),
        needsUpdate: false,
        metadata: {},
        customUpdate: null,
        mouseClickListener: null,
        rotationMode: false,
        mouse: {
            x: 0,
            y: 0
        },
        visualModelMap: null,
        idCounter: 0,
        sceneCenter: new THREE.Vector3(),
        cameraPosition: new THREE.Vector3(),
        canvasCreated: false,
        listenersCreated: false,
        selected: [],
        pickingEnabled: true, // flag to enable disable 3d picking
        playTimerStep: 5, // timer step in milliseconds
        playLoop: false,
        backgroundColor: 0x101010,
    };

    /**
     * Initialize the engine
     *
     * @class GEPPETTO
     */
    var GEPPETTO = {


        /**
         * Initialize Geppetto
         *
         * @param {HTML}
         *            containerp - HTML element to draw the 3D Scene
         * @returns {Boolean}
         */
        //AQP: Almost same code!!!!!!!!!!!
        init: function (containerp) {
            if (!isWebglEnabled) {
                Detector.addGetWebGLMessage();
                return false;
            } else {
                VARS = GEPPETTO.Init.initialize(containerp);
                return true;
            }
        },

        /**
         *
         * @returns {Boolean} True or false, whether webgl is detected or not
         */
        webGLAvailable: function () {
            if (isWebglEnabled) {
                return true;
            }
            else {
                Detector.addGetWebGLMessage();
                return false;
            }
            // if (!Detector.webgl) {
            //     Detector.addGetWebGLMessage();
            //     return false;
            // } else {
            //     return true;
            // }
        },

        /**
         * Returns variables object used to store meshes, and other properties
         * of the 3D scene
         *
         * @returns {Object} Object with important properties for the 3D Scene.
         */
        getVARS: function () {
            return VARS;
        },

        /**
         * Set object local rotation, with respect to z (Euler angle)
         *
         * @param {AspectNode}
         *            aspect - the aspect containing the entity to rotate
         * @param {String}
         *            entityName - the name of the entity to be rotated (in the
         *            3d model)
         * @param {Float}
         *            angle - the angle (radians) of the local rotation around z
         */
        setLocalRotationZ: function (aspect, entityName, angle) {
            // TODO: the first arg should be a vis tree
            var threeObject = GEPPETTO.get3DObjectInVisualizationTree(aspect
                .getInstancePath(), entityName);
            if (threeObject != null) {
                threeObject.rotation.z = angle;
            }
        },

        /**
         * Reset camera for scene.
         */
        resetCamera: function () {
            GEPPETTO.getVARS().controls.reset();

            var aabbMin = null;
            var aabbMax = null;

            GEPPETTO.getVARS().scene.traverse(function (child) {
                if (child.hasOwnProperty("geometry")) {
                    child.geometry.computeBoundingBox();

                    var bb = child.geometry.boundingBox;
                    bb.translate(child.localToWorld(new THREE.Vector3()));

                    // If min and max vectors are null, first values become
                    // default min and max
                    if (aabbMin == null && aabbMax == null) {
                        aabbMin = bb.min;
                        aabbMax = bb.max;
                    }

                    // Compare other meshes, particles BB's to find min and max
                    else {
                        aabbMin.x = Math.min(aabbMin.x, bb.min.x);
                        aabbMin.y = Math.min(aabbMin.y, bb.min.y);
                        aabbMin.z = Math.min(aabbMin.z, bb.min.z);
                        aabbMax.x = Math.max(aabbMax.x, bb.max.x);
                        aabbMax.y = Math.max(aabbMax.y, bb.max.y);
                        aabbMax.z = Math.max(aabbMax.z, bb.max.z);
                    }
                }
            });

            if (aabbMin != null && aabbMax != null) {
                // Compute world AABB center
                GEPPETTO.getVARS().sceneCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
                GEPPETTO.getVARS().sceneCenter.y = (aabbMax.y + aabbMin.y) * 0.5;
                GEPPETTO.getVARS().sceneCenter.z = (aabbMax.z + aabbMin.z) * 0.5;

                GEPPETTO.updateCamera(aabbMax, aabbMin);
            }
        },

        /**
         * Update camera with new position and place to lookat
         */
        updateCamera: function (aabbMax, aabbMin) {
            // Compute world AABB "radius"
            var diag = new THREE.Vector3();
            diag = diag.subVectors(aabbMax, aabbMin);
            var radius = diag.length() * 0.5;

            GEPPETTO.pointCameraTo(GEPPETTO.getVARS().sceneCenter);

            // Compute offset needed to move the camera back that much needed to center AABB
            var offset = radius / Math.sin(Math.PI / 180.0 * GEPPETTO.getVARS().camera.fov * 0.5);

            var dir = GEPPETTO.getVARS().camera.direction.clone();
            dir.multiplyScalar(offset);

            // Store camera position
            GEPPETTO.getVARS().camera.position.addVectors(dir, GEPPETTO.getVARS().controls.target);
            GEPPETTO.getVARS().camera.updateProjectionMatrix();
        },

        boundingBox: function (obj) {
            if (obj instanceof THREE.Mesh) {

                var geometry = obj.geometry;
                geometry.computeBoundingBox();
                return geometry.boundingBox;

            }

            if (obj instanceof THREE.Object3D) {

                var bb = new THREE.Box3();
                for (var i = 0; i < obj.children.length; i++) {
                    bb.union(GEPPETTO.boundingBox(obj.children[i]));
                }
                return bb;
            }
        },

        shapeCenterOfGravity: function (obj) {
            return GEPPETTO.boundingBox(obj).center();
        },

        /** */
        pointCameraTo: function (node) {
            // Refocus camera to the center of the new object
            var COG;
            if (node instanceof THREE.Vector3) {
                COG = node;
            } else {
                COG = GEPPETTO.shapeCenterOfGravity(node);
            }
            var v = new THREE.Vector3();
            v.subVectors(COG, GEPPETTO.getVARS().controls.target);
            GEPPETTO.getVARS().camera.position.addVectors(
                GEPPETTO.getVARS().camera.position, v);

            // retrieve camera orientation

            GEPPETTO.getVARS().camera.lookAt(COG);
            GEPPETTO.getVARS().controls.target.set(COG.x, COG.y, COG.z);
        },

        /**
         * Status of scene, populated or not
         *
         * @returns {Boolean} True or false depending whether scene is populated
         *          or not
         */
        isScenePopulated: function () {
            return !(_.isEmpty(GEPPETTO.getVARS().visualModelMap));
        },

        /**
         * Has canvas been created?
         *
         * @returns {Boolean] True or false if canvas has been created or not
		 */
        isCanvasCreated: function () {
            return GEPPETTO.getVARS().canvasCreated;
        },

        /**
         * Sets up the HUD display with the scene stat's fps.
         */
        setupStats: function () {
            // Stats
            if ($("#stats").length == 0) {
                if (VARS != null) {
                    GEPPETTO.getVARS().stats = new Stats();
                    GEPPETTO.getVARS().stats.domElement.style.float = 'right';
                    GEPPETTO.getVARS().stats.domElement.style.position = 'absolute';
                    GEPPETTO.getVARS().stats.domElement.style.top = '60px';
                    GEPPETTO.getVARS().stats.domElement.style.right = '5px';
                    GEPPETTO.getVARS().stats.domElement.style.zIndex = 100;
                    $('#controls').append(GEPPETTO.getVARS().stats.domElement);
                }
            }
        },

        /**
         * Displays HUD for FPS stats
         */
        toggleStats: function (mode) {
            if (mode) {
                if ($("#stats").length == 0) {
                    GEPPETTO.setupStats();
                } else {
                    $("#stats").show();
                }
            } else {
                $("#stats").hide();
            }
        },


        /**
         * Adds debug axis to the scene
         */
        setupAxis: function () {
            // To use enter the axis length
            GEPPETTO.getVARS().scene.add(new THREE.AxisHelper(200));
        },

        /**
         * Renders objects in the scene
         */
        render: function () {
            GEPPETTO.getVARS().renderer.clear();
            GEPPETTO.getVARS().composer.render(0.01);
        },

        /**
         * Returns intersected objects from mouse click
         *
         * @returns {Array} a list of objects intersected by the current mouse
         *          coordinates
         */
        getIntersectedObjects: function () {
            // create a Ray with origin at the mouse position and direction into th scene (camera direction)
            var vector = new THREE.Vector3(GEPPETTO.getVARS().mouse.x, GEPPETTO
                .getVARS().mouse.y, 1);
            vector.unproject(GEPPETTO.getVARS().camera);

            var raycaster = new THREE.Raycaster(
                GEPPETTO.getVARS().camera.position, vector.sub(
                    GEPPETTO.getVARS().camera.position).normalize());

            var visibleChildren = [];
            GEPPETTO.getVARS().scene.traverse(function (child) {
                if (child.visible && !(child.clickThrough == true)) {
                    if (child.geometry != null || undefined) {
                        child.geometry.computeBoundingBox();
                    }
                    visibleChildren.push(child);
                }
            });

            // returns an array containing all objects in the scene with which
            // the ray intersects
            return raycaster.intersectObjects(visibleChildren);
        },

        /**
         * @param{String} key - The pressed key
         * @returns {boolean} True if the key is pressed
         */
        isKeyPressed: function (key) {
            return GEPPETTO.getVARS().keyboard.pressed(key);
        },

        /**
         * @param x
         * @param y
         */
        incrementCameraPan: function (x, y) {
            GEPPETTO.getVARS().controls.incrementPanEnd(x, y);
        },

        /**
         * @param x
         * @param y
         * @param z
         */
        incrementCameraRotate: function (x, y, z) {
            GEPPETTO.getVARS().controls.incrementRotationEnd(x, y, z);
        },

        /**
         * @param z
         */
        incrementCameraZoom: function (z) {
            GEPPETTO.getVARS().controls.incrementZoomEnd(z);
        },

        /**
         * @param x
         * @param y
         * @param z
         */
        setCameraPosition: function (x, y, z) {
            GEPPETTO.getVARS().controls.setPosition(x, y, z);
        },

        /**
         * @param rx
         * @param ry
         * @param rz
         * @param radius
         */
        setCameraRotation: function (rx, ry, rz, radius) {
            GEPPETTO.getVARS().controls.setRotation(rx, ry, rz, radius);
        },

        /**
         * @param msg
         */
        log: function (msg) {
            if (GEPPETTO.getVARS().debug) {
                var d = new Date();
                var curr_hour = d.getHours();
                var curr_min = d.getMinutes();
                var curr_sec = d.getSeconds();
                var curr_msec = d.getMilliseconds();

                console.log(curr_hour + ":" + curr_min + ":" + curr_sec + ":"
                    + curr_msec + ' - ' + msg, "");

            }
        },

        /**
         * @param category
         * @param action
         * @param opt_label
         * @param opt_value
         * @param opt_noninteraction
         */
        trackActivity: function (category, action, opt_label, opt_value, opt_noninteraction) {
            if (typeof _gaq != 'undefined') {
                _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
            }
        },

        winHeight: function () {
            return window.innerHeight || (document.documentElement || document.body).clientHeight;
        }
    };

    _.extend(GEPPETTO, Backbone.Events);

    require('../../components/interface/jsConsole/SandboxConsole')(GEPPETTO);
    require('../../common/GEPPETTO.Resources')(GEPPETTO);
    require('./GEPPETTO.Events')(GEPPETTO);
    require('./GEPPETTO.Init')(GEPPETTO);
    require('../../components/interface/3dCanvas/GEPPETTO.SceneFactory')(GEPPETTO);
    require('../../components/interface/3dCanvas/GEPPETTO.SceneController')(GEPPETTO);
    require('./GEPPETTO.FE')(GEPPETTO);
    require('../../common/GEPPETTO.UserController')(GEPPETTO);
    require('./GEPPETTO.Flows')(GEPPETTO);
    require('../../common/GEPPETTO.ScriptRunner')(GEPPETTO);
    require('../../components/interface/jsEditor/GEPPETTO.JSEditor')(GEPPETTO);
    require('../../components/interface/jsConsole/GEPPETTO.Console')(GEPPETTO);
    require('../../common/GEPPETTO.Utility')(GEPPETTO);
    require('../../components/widgets/MenuManager')(GEPPETTO);
    require('../../communication/MessageSocket')(GEPPETTO);
    require('../../communication/GEPPETTO.GlobalHandler')(GEPPETTO);
    require('../../communication/MessageHandler')(GEPPETTO);
    require('./G')(GEPPETTO);
    require('./GEPPETTO.Main')(GEPPETTO);
    require("../../components/widgets/includeWidget")(GEPPETTO);
    require('../../geppettoProject/ProjectFactory')(GEPPETTO);
    require('../../geppettoModel/ModelFactory')(GEPPETTO);
    require('../../geppettoProject/ExperimentsController')(GEPPETTO);
    require('../../geppettoModel/QueriesController')(GEPPETTO);
    require('../../geppettoProject/ProjectsController')(GEPPETTO);

    return GEPPETTO;

});
