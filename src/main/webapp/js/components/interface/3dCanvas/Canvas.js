define(function (require) {

    require('./Canvas.less');

    var React = require('react');
    var Instance = require('../../../geppettoModel/model/Instance');
    var ArrayInstance = require('../../../geppettoModel/model/ArrayInstance');
    var Type = require('../../../geppettoModel/model/Type');
    var Variable = require('../../../geppettoModel/model/Variable');
    var isWebglEnabled = require('detector-webgl');
    var ThreeDEngine = require('./ThreeDEngine');
    var CameraControls = require('../cameraControls/CameraControls');
    var AbstractComponent = require('../../AComponent');

    return class Canvas extends AbstractComponent {


        constructor(props) {
            super(props);

            this.engine = null
            // this.container = null

            //State
            this.viewState = {
                custom: {
                    cameraPosition: {x: undefined, y: undefined, z: undefined},
                    cameraRotation: {rx: undefined, ry: undefined, rz: undefined, radius: undefined},
                    colorMap: {},
                    colorFunctionMap: {},
                    opacityMap: {},
                    geometryTypeMap: {},
                    backgroundColor: "0x101010"
                },
                instances: []
            }

        }

        /**
         * Displays all the passed instances in this canvas component
         * @param instances an array of instances
         * @returns {Canvas}
         */
        display(instances) {
            var added = [];
            for (var i = 0; i < instances.length; i++) {
                if (this.viewState.instances.indexOf(instances[i].getInstancePath()) == -1) {
                    this.viewState.instances.push(instances[i].getInstancePath());
                    added.push(instances[i]);
                }
            }
            if (added.length > 0) {
                this.engine.updateSceneWithNewInstances(added);
                this.setDirty(true);
            }
            return this;
        }

        /**
         * Remove all the passed instances from this canvas component
         * This method is only able to remove instances that were explicitly added
         * e.g. if acnet2 is added acent2.baskets[3] can't be removed.
         * @param instances an array of instances
         * @returns {Canvas}
         */
        remove(instances) {
            var removed = false;
            for (var i = 0; i < instances.length; i++) {
                if (this.viewState.instances.indexOf(instances[i].getInstancePath()) != -1) {
                    this.viewState.instances.splice(this.viewState.instances.indexOf(instances[i].getInstancePath()), 1);
                    this.engine.removeFromScene(instances[i]);
                    removed = true;
                }
            }
            if (removed) {
                this.setDirty(true);
                this.resetCamera();
            }
            return this;
        }


        /**
         * Displays all the instances available in the current model in this canvas
         * @returns {Canvas}
         */
        displayAllInstances() {
            var that = this;
            //TODO if the component is added after the events are triggered traverse all the existing instances
            GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
                that.display(instances);

            });
            GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (instance) {
                that.remove([instance]);
            });
            return this;
        }

        /**
         * Selects an instance
         *
         * @param {String} instancePath - Path of instance to select
         * @param {String} geometryIdentifier - Identifier of the geometry that was clicked
         * @return {Canvas}
         */
        selectInstance(instancePath, geometryIdentifier) {
            this.engine.selectInstance(instancePath, geometryIdentifier);
            return this;
        }


        /**
         * Deselects an instance given its path
         * @param instancePath
         * @returns {Canvas}
         */
        deselectInstance(instancePath) {
            this.engine.deselectInstance(instancePath);
            return this;
        }

        /**
         *
         * @param instance
         * @returns {Canvas}
         */
        assignRandomColor(instance) {
            this.engine.assignRandomColor(instance);
            return this;
        }

        /**
         * Zoom to the passed instances
         * @param instances
         * @return {Canvas}
         */
        zoomTo(instances) {
            this.engine.zoomTo(instances);
            return this;
        }

        /**
         * Sets whether to use wireframe or not to visualize any instance.
         * @param wireframe
         * @return {Canvas}
         */
        setWireframe(wireframe) {
            this.engine.setWireframe(wireframe);
            return this;
        }

        /**
         * Show an instance
         *
         * @param instancePath Instance path of the instance to make visible
         * @return {Canvas}
         */
        showInstance(instancePath) {
            this.engine.showInstance(instancePath);
            return this;
        }

        /**
         * Hide an instance
         *
         * @param instancePath Path of the instance to hide
         * @return {Canvas}
         */
        hideInstance(instancePath) {
            this.engine.hideInstance(instancePath);
            return this;
        }

        /**
         * Set background color for this canvas
         *
         * * @param {String} color - hex or rgb color. e.g. "#ff0000" / "rgb(255,0,0)"
         * @return {Canvas}
         */
        setBackgroundColor(color) {
            this.viewState.custom.backgroundColor = color;
            this.setDirty(true);
            $(this.getContainer()).css("background", color);
            return this;
        }


        /**
         * Change the color of a given entity
         *
         * @param path path of the instance, variable or type to change color of
         * @param color The color to set
         * @param recursion if true the function is calling itself
         * @return {Canvas}
         */
        setColor(path, color, recursion) {
            if (recursion === undefined) {
                recursion = false;
            }
            var entity = eval(path);
            if (entity.hasCapability("VisualCapability")) {
                if (entity instanceof Instance || entity instanceof ArrayInstance) {

                    this.engine.setColor(path, color);

                    if (typeof entity.getChildren === "function") {
                        var children = entity.getChildren();
                        for (var i = 0; i < children.length; i++) {
                            this.setColor(children[i].getInstancePath(), color, true);
                        }
                    }

                } else if (entity instanceof Type || entity instanceof Variable) {
                    // fetch all instances for the given type or variable and call hide on each
                    var instances = GEPPETTO.ModelFactory.getAllInstancesOf(entity);
                    for (var j = 0; j < instances.length; j++) {
                        this.setColor(instances[j].getInstancePath(), color, true);
                    }
                }
                if (!recursion) {
                    this.viewState.custom.colorMap[path] = color;
                    this.setDirty(true);
                }
            }
            return this;
        }

        /**
         * Change the default opacity for a given instance
         *
         * @param instancePath Instance path of the instance to set the opacity of
         * @param opacity The value of the opacity between 0 and 1
         * @return {Canvas}
         */

        /**
         * Retrieves the color of a given instance
         *
         * @param instance - Instance we want the color of
         * @return {*|string}
         */
        getColor(instance) {
            return this.engine.getColor(instance);
        }


        /**
         *
         * @param instancePath
         * @param opacity
         * @returns {Canvas}
         */
        setOpacity(instancePath, opacity, recursion) {
            if (recursion === undefined) {
                recursion = false;
            }
            var entity = eval(path);
            if (entity.hasCapability("VisualCapability")) {
                if (entity instanceof Instance || entity instanceof ArrayInstance) {
                    this.engine.setOpacity(instancePath, opacity);

                    if (typeof entity.getChildren === "function") {
                        var children = entity.getChildren();
                        for (var i = 0; i < children.length; i++) {
                            this.setOpacity(children[i].getInstancePath(), opacity, true);
                        }
                    }
                } else if (entity instanceof Type || entity instanceof Variable) {
                    // fetch all instances for the given type or variable and call hide on each
                    var instances = GEPPETTO.ModelFactory.getAllInstancesOf(entity);
                    for (var j = 0; j < instances.length; j++) {
                        this.setOpacity(instancePath, opacity, true);
                    }
                }
                if (!recursion) {
                    this.viewState.custom.opacityMap[instancePath] = opacity;
                    this.setDirty(true);
                }
            }

            return this;
        }

        /**
         * Set the threshold (number of 3D primitives on the scene) above which we switch the visualization to lines
         * @param threshold
         * @return {Canvas}
         */
        setLinesThreshold(threshold) {
            this.engine.setLinesThreshold(threshold);
            return this;
        }

        /**
         * Change the type of geometry used to visualize a given instance
         *
         * @param instance The instance to change the geometry type for
         * @param type The geometry type, see GEPPETTO.Resources.GeometryTypes
         * @param thickness Optional: the thickness to be used if the geometry is "lines"
         * @return {Canvas}
         */
        setGeometryType(instance, type, thickness, recursion) {

            if (recursion === undefined) {
                recursion = false;
            }

            if (instance.hasCapability("VisualCapability")) {
                if (instance instanceof Instance || instance instanceof ArrayInstance) {
                    this.engine.setGeometryType(instance, type, thickness);

                    if (typeof instance.getChildren === "function") {
                        var children = instance.getChildren();
                        for (var i = 0; i < children.length; i++) {
                            this.setGeometryType(children[i], type, thickness, true);
                        }
                    }
                } else if (instance instanceof Type || instance instanceof Variable) {
                    // fetch all instances for the given type or variable and call hide on each
                    var instances = GEPPETTO.ModelFactory.getAllInstancesOf(instance);
                    for (var j = 0; j < instances.length; j++) {
                        this.setGeometryType(instance, type, thickness, true);
                    }
                }
                if (!recursion) {
                    this.viewState.custom.geometryTypeMap[instance.getInstancePath()] = {"type": type, "thickness": thickness};
                    this.setDirty(true);
                }
            }

            return this;
        }


        /**
         * Activates a visual group
         * @param visualGroup
         * @param mode
         * @param instances
         * @return {Canvas}
         */
        showVisualGroups(visualGroup, mode, instances) {
            this.engine.showVisualGroups(visualGroup, mode, instances);
            return this;
        }

        /**
         * Associate a color function to a group of instances
         *
         * @param instances - The instances we want to change the color of
         * @param colorfn - The function to be used to modulate the color
         * @return {Canvas}
         */
        addColorFunction(instances, colorfn) {
            this.engine.colorController.addColorFunction(instances, colorfn);
            for (var i = 0; i < instances.length; i++) {
                this.viewState.custom.colorFunctionMap[instances[i].getInstancePath()] = colorfn.toString();
            }
            this.setDirty(true);
            return this;
        }

        /**
         * Remove a previously associated color function
         *
         * @param instances
         * @return {Canvas}
         */
        removeColorFunction(instances) {
            for (var i = 0; i < instances.length; i++) {
                if (this.colorFunctionMap[instances[i].getInstancePath()] != undefined) {
                    delete this.viewState.custom.colorFunctionMap[instances[i].getInstancePath()];
                }
            }
            this.setDirty(true);
            this.engine.colorController.removeColorFunction(instances);
            return this;
        }

        /**
         * Returns all the instances that are being listened to
         *
         * @return {Array}
         */
        getColorFunctionInstances() {
            return this.engine.colorController.getColorFunctionInstances();
        }

        /**
         * Shows the visual groups associated to the passed instance
         * @param instance
         * @returns {Canvas}
         */
        showVisualGroupsForInstance(instance) {
            this.engine.showVisualGroupsForInstance(instance);
            return this;
        }

        /**
         * @param x
         * @param y
         * @return {Canvas}
         */
        incrementCameraPan(x, y) {
            this.engine.incrementCameraPan(x, y);
            return this;
        }

        /**
         * @param x
         * @param y
         * @param z
         * @return {Canvas}
         */
        incrementCameraRotate(x, y, z) {
            this.engine.incrementCameraRotate(x, y, z);
            return this;
        }

        /**
         * @param z
         * @return {Canvas}
         */
        incrementCameraZoom(z) {
            this.engine.incrementCameraZoom(z);
            return this;
        }

        /**
         * @param x
         * @param y
         * @param z
         * @return {Canvas}
         */
        setCameraPosition(x, y, z) {
            this.viewState.custom.cameraPosition.x = x;
            this.viewState.custom.cameraPosition.y = y;
            this.viewState.custom.cameraPosition.z = z;
            this.setDirty(true);
            this.engine.setCameraPosition(x, y, z);
            return this;
        }

        /**
         * @param rx
         * @param ry
         * @param rz
         * @param radius
         */
        setCameraRotation(rx, ry, rz, radius) {
            this.viewState.custom.cameraRotation.rx = rx;
            this.viewState.custom.cameraRotation.ry = ry;
            this.viewState.custom.cameraRotation.rz = rz;
            this.viewState.custom.cameraRotation.radius = radius;
            this.setDirty(true);
            this.engine.setCameraRotation(rx, ry, rz, radius);
            return this;
        }

        /**
         * Rotate the camera around the selection
         *
         * @return {Canvas}
         */
        autoRotate() {
            this.engine.autoRotate();
            return this;
        }

        /**
         * Resets the camera
         *
         * @returns {Canvas}
         */
        resetCamera() {
            this.engine.resetCamera();
            return this;
        }


        /**
         * Set container dimensions depending on parent dialog
         * @return {*[]}
         */
        setContainerDimensions() {
            var containerSelector = $(this.getContainer());
            var height = containerSelector.parent().height();
            var width = containerSelector.parent().width();
            containerSelector.height(height);
            containerSelector.width(width);
            return [width, height];
        }

        /**
         *
         * @param view
         */
        setView(view) {
            // set base properties
            super.setView(view)

            // set data
            if (view.data != undefined) {
                if (view.dataType == 'instances') {
                    var instances = [];
                    for (var i = 0; i < view.data.length; i++) {
                        instances.push(eval(view.data[i]));
                    }
                    this.display(instances);
                }
            }

            // set component specific stuff, only custom handlers for popup widget
            if (view.componentSpecific != undefined) {
                if (view.componentSpecific.cameraRotation != undefined && view.componentSpecific.cameraRotation != undefined) {
                    this.setCameraRotation(
                        view.componentSpecific.cameraRotation.rx,
                        view.componentSpecific.cameraRotation.ry,
                        view.componentSpecific.cameraRotation.rz,
                        view.componentSpecific.cameraRotation.radius);
                }
                if (view.componentSpecific.cameraPosition != undefined && view.componentSpecific.cameraPosition.x != undefined) {
                    this.setCameraPosition(
                        view.componentSpecific.cameraPosition.x,
                        view.componentSpecific.cameraPosition.y,
                        view.componentSpecific.cameraPosition.z);
                }
                if (view.componentSpecific.colorMap != undefined) {
                    for (var path in view.componentSpecific.colorMap) {
                        this.setColor(path, view.componentSpecific.colorMap[path]);
                    }
                }
                if (view.componentSpecific.opacityMap != undefined) {
                    for (var path in view.componentSpecific.opacityMap) {
                        this.setOpacity(path, view.componentSpecific.opacityMap[path]);
                    }
                }
                if (view.componentSpecific.geometryTypeMap != undefined) {
                    for (var path in view.componentSpecific.geometryTypeMap) {
                        this.setGeometryType(eval(path),
                            view.componentSpecific.geometryTypeMap[path].type,
                            view.componentSpecific.geometryTypeMap[path].thickness);
                    }
                }
                if (view.componentSpecific.colorFunctionMap != undefined) {
                    for (var path in view.componentSpecific.colorFunctionMap) {
                        this.addColorFunction([eval(path)], eval("(" + view.componentSpecific.colorFunctionMap[path] + ")"));
                    }
                }
                if (view.componentSpecific.backgroundColor != undefined) {
                    this.setBackgroundColor(view.componentSpecific.backgroundColor);
                }
            }
        }


        /**
         *
         * @returns {{widgetType, isWidget}|{size: {height: *, width: *}, position: {left: *, top: *}}}
         */
        getView() {
            // add data-type and data field + any other custom fields in the component-specific attribute
            var baseView = super.getView();
            baseView.dataType = "instances";
            baseView.data = this.viewState.instances;
            baseView.componentSpecific = this.viewState.custom;
            return baseView;
        }

        /**
         *
         * @returns {boolean}
         */
        shouldComponentUpdate() {
            return false;
        }


        /**
         *
         */
        componentDidMount() {
            if (!isWebglEnabled) {
                Detector.addGetWebGLMessage();
            } else {
                // this.container = $("#" + this.props.id + "_component").get(0);
                var [width, height] = this.setContainerDimensions();
                this.engine = new ThreeDEngine(this.getContainer(), this.props.id);
                this.engine.setSize(width, height);

                GEPPETTO.SceneController.add3DCanvas(this);

                var that = this;
                $("#" + this.props.id).on("dialogresizestop resizeEnd", function (event, ui) {
                    var [width, height] = that.setContainerDimensions();
                    that.engine.setSize(width, height);
                });

                window.addEventListener('resize', function () {
                    var [width, height] = that.setContainerDimensions();
                    that.engine.setSize(width, height);
                }, false);

            }
        }

        /**
         *
         * @returns {XML}
         */
        render() {
            return (
                <div key={this.props.id + "_component"} id={this.props.id + "_component"} className="canvas">
                    <CameraControls viewer={this.props.id}/>
                </div>
            )
        }
    };

});