import * as THREE from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader.js';

import MeshFactory from './MeshFactory';
import Instance from '@metacell/geppetto-meta-core/model/Instance';
import ArrayInstance from '@metacell/geppetto-meta-core//model/ArrayInstance';
import Type from '@metacell/geppetto-meta-core/model/Type';
import Variable from '@metacell/geppetto-meta-core/model/Variable';
import SimpleInstance from "@metacell/geppetto-meta-core/model/SimpleInstance";
import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import Resources from '@metacell/geppetto-meta-core/Resources';

import CameraManager from './CameraManager';
import { TrackballControls } from './TrackballControls';
import { rgbToHex, hasVisualType } from "./util";

export default class ThreeDEngine {
  constructor (
    containerRef,
    cameraOptions,
    cameraHandler,
    captureOptions,
    onSelection,
    backgroundColor,
    pickingEnabled,
    linesThreshold,
    hoverListeners,
    setColorHandler,
    selectionStrategy
  ) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(backgroundColor);
    this.cameraManager = null;
    this.cameraOptions = cameraOptions;
    this.onSelection = onSelection;
    this.renderer = null;
    this.controls = null;
    this.mouse = { x: 0, y: 0 };
    this.mouseContainer = { x: 0, y: 0 }
    this.frameId = null;
    this.meshFactory = new MeshFactory(this.scene, linesThreshold);
    this.pickingEnabled = pickingEnabled;
    this.hoverListeners = hoverListeners;
    this.cameraHandler = cameraHandler;
    this.setColorHandler = setColorHandler;
    this.selectionStrategy = selectionStrategy
    this.containerRef = containerRef
    this.width = containerRef.clientWidth;
    this.height = containerRef.clientHeight;
    this.lastRequestFrame = 0 ;
    this.lastRenderTimer = new Date();

    // Setup Camera
    this.setupCamera(cameraOptions, this.width / this.height);

    // Setup Renderer
    this.setupRenderer(containerRef, { antialias: true, alpha: true, preserveDrawingBuffer: captureOptions !== undefined });

    // Setup Lights
    this.setupLights();

    // Setup Controls
    this.setupControls();

    // Setup Listeners
    this.setupListeners = this.setupListeners.bind(this);
    this.setupListeners(onSelection);

    this.start = this.start.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.stop = this.stop.bind(this);
    this.resize = this.resize.bind(this);
    this.requestFrameBounding = this.requestFrame.bind(this);
    this.stop = this.stop.bind(this);
    this.mouseDownEventListener = this.mouseDownEventListener.bind(this);
    this.mouseUpEventListener = this.mouseUpEventListener.bind(this);
    this.mouseMoveEventListener = this.mouseMoveEventListener.bind(this);
    this.update = this.update.bind(this);
    this.mouseRayCaster = new THREE.Raycaster();
    this.setupRenderer = this.setupRenderer.bind(this);
  }

  /**
   * Setups the camera
   * @param cameraOptions
   * @param aspect
   */
  setupCamera (cameraOptions, aspect) {
    this.cameraManager = new CameraManager(this, {
      ...cameraOptions,
      aspect,
    });
  }

  /**
   * Setups the renderer
   * @param containerRef
   */
  setupRenderer (containerRef, options) {
    this.renderer = new THREE.WebGLRenderer(options);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    containerRef.appendChild(this.renderer.domElement);
    this.configureRenderer(false);
  }

  /**
   *
   * @param shaders
   */
  configureRenderer (shaders) {
    if (shaders === undefined) {
      shaders = false;
    }

    const renderModel = new RenderPass(
      this.scene,
      this.cameraManager.getCamera()
    );
    this.composer = new EffectComposer(this.renderer);

    if (shaders) {
      const effectBloom = new BloomPass(0.75);
      // todo: grayscale shouldn't be false
      const effectFilm = new FilmPass(0.5, 0.5, 1448, false);
      const effectFocus = new ShaderPass(FocusShader);

      effectFocus.uniforms['screenWidth'].value = this.width;
      effectFocus.uniforms['screenHeight'].value = this.height;
      effectFocus.renderToScreen = true;

      this.composer.addPass(renderModel);
      this.composer.addPass(effectBloom);
      this.composer.addPass(effectFilm);
      this.composer.addPass(effectFocus);
    } else {
      // standard
      renderModel.renderToScreen = true;
      this.composer.addPass(renderModel);
    }
  }

  /**
   * Setups the lights
   */
  setupLights () {
    const ambientLight = new THREE.AmbientLight(0x0c0c0c);
    this.scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-30, 60, 60);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    this.cameraManager.getCamera().add(new THREE.PointLight(0xffffff, 1));
  }

  setupControls () {
    this.controls = new TrackballControls(
      this.cameraManager.getCamera(),
      this.renderer.domElement,
      this.cameraHandler,
    );
    this.controls.noZoom = false;
    this.controls.noPan = false;
  }

  /**
   * Returns intersected objects from mouse click
   *
   * @returns {Array} a list of objects intersected by the current mouse coordinates
   */
  getIntersectedObjects () {
    // create a Ray with origin at the mouse position and direction into th scene (camera direction)
    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);
    vector.unproject(this.cameraManager.getCamera());

    const raycaster = new THREE.Raycaster(
      this.cameraManager.getCamera().position,
      vector.sub(this.cameraManager.getCamera().position).normalize()
    );
    raycaster.linePrecision = this.meshFactory.getLinePrecision();

    const visibleChildren = [];
    this.scene.traverse(function (child) {
      if (child.visible && !(child.clickThrough === true)) {
        if (child.geometry != null) {
          if (child.type !== 'Points') {
            child.geometry.computeBoundingBox();
          }
          visibleChildren.push(child);
        }
      }
    });

    // returns an array containing all objects in the scene with which the ray intersects
    return raycaster.intersectObjects(visibleChildren);
  }

  /**
   * Adds instances to the ThreeJS Scene
   * @param proxyInstances
   */
  async addInstancesToScene (proxyInstances) {
    const instances = proxyInstances.map(pInstance => Instances.getInstance(pInstance.instancePath));
    await this.meshFactory.start(instances);
    this.updateGroupMeshes(proxyInstances);
  }


  /*
   * Check that the material for the already present instance did not change.
   * return true if the color changed, otherwise false.
   */


  checkMaterial (mesh, instance) {
    if (mesh.type === 'Mesh') {
      if (mesh.material.color.r === instance?.color?.r
        && mesh.material.color.g === instance?.color?.g
        && mesh.material.color.b === instance?.color?.b
        && mesh.material.color.opacity === instance?.color?.a) {
        return false;
      } else {
        return true;
      }
    } else if (mesh.type === 'Group') {
      var changed = false;
      for (let child of mesh.children) {
        if (this.checkMaterial(child, instance)) {
          changed = true;
        }
      }
      return changed;
    }
  }


  updateInstanceMaterial (mesh, instance) {
    for (let child of this.scene.children) {
      if (child.instancePath === mesh.instancePath && child.uuid === mesh.uuid) {
        if (instance?.color !== undefined) {
          this.setInstanceMaterial(child, instance);
          break;
        } else {
          instance.color = GEPPETTO.Resources.COLORS.DEFAULT;
          this.setInstanceMaterial(child, instance);
        }
      }
    }
  }


  setInstanceMaterial (mesh, instance) {
    if (mesh.type === 'Mesh') {
      this.meshFactory.setThreeColor(mesh.material.color, instance.color);
      if (instance.color.a) {
        mesh.material.transparent = true;
        mesh.material.opacity = instance.color.a;
      }
    } else if (mesh.type === 'Group') {
      for (let child of mesh.children) {
        this.setInstanceMaterial(child, instance);
      }
    }
  }

  /**
   * Clears the scene
   *
   * we have the list of strings instances
   * we have the global Instances from the model
   * we have the obj instances in the threeJS scene
   */

  checkInstanceToRemove (geppettoInstance, proxyInstance, toRemove, pathsToRemove) {
    try {
      if (hasVisualValue(geppettoInstance)) {
        var geppettoIndex = pathsToRemove.indexOf(geppettoInstance.getInstancePath());
        if (geppettoIndex > -1) {
          if (this.checkMaterial(toRemove[geppettoIndex], proxyInstance)) {
            this.updateInstanceMaterial(toRemove[geppettoIndex], proxyInstance);
          }
          toRemove.splice(geppettoIndex, 1);
          pathsToRemove.splice(geppettoIndex, 1);
          return true;
        }
        return false;
      } else if (hasVisualType(geppettoInstance)) {
        if (
          geppettoInstance.getType().getMetaType()
            !== GEPPETTO.Resources.ARRAY_TYPE_NODE
            && geppettoInstance.getVisualType()
        ) {
          var geppettoIndex = pathsToRemove.indexOf(geppettoInstance.getInstancePath());
          if (geppettoIndex > -1) {
            if (this.checkMaterial(toRemove[geppettoIndex], proxyInstance)) {
              this.updateInstanceMaterial(toRemove[geppettoIndex], proxyInstance);
            }
            toRemove.splice(geppettoIndex, 1);
            pathsToRemove.splice(geppettoIndex, 1);
            return true;
          }
          return false;
        }
        // this block keeps traversing the instances
        if (geppettoInstance.getMetaType() === GEPPETTO.Resources.INSTANCE_NODE) {
          var returnValue = false;
          var children = geppettoInstance.getChildren();
          for (let i = 0; i < children.length; i++) {
            let instanceReturn = this.checkInstanceToRemove(children[i], proxyInstance, toRemove, pathsToRemove);
            returnValue = returnValue || instanceReturn;
          }
          return returnValue;
        } else if (
          geppettoInstance.getMetaType() === GEPPETTO.Resources.ARRAY_INSTANCE_NODE
        ) {
          var returnValue = false;
          for (let i = 0; i < geppettoInstance.length; i++) {
            let instanceReturn = this.checkInstanceToRemove(geppettoInstance[i], proxyInstance, toRemove, pathsToRemove);
            returnValue = returnValue || instanceReturn;
          }
          return returnValue;
        }
      }
    } catch (e) {
      console.error(e)
    }
  }


  async clearScene (proxyInstances) {
    var pathsToRemove = [];
    var sortedInstances = [];
    var toRemove = this.scene.children.filter(child => {
      if (child.type === 'Mesh' || child.type === 'Group') {
        pathsToRemove.push(child.instancePath)
        return true;
      }
      return false;
    });

    if (proxyInstances) {
      sortedInstances = proxyInstances.sort((a, b) => {
        if (a.instancePath < b.instancePath) {
          return -1;
        }
        if (a.instancePath > b.instancePath) {
          return 1;
        }
        return 0;
      });
      if (toRemove.length === 0) {
        return sortedInstances;
      }
      for (var i = sortedInstances.length - 1; i >= 0; i--) {
        var geppettoInstance = Instances.getInstance(sortedInstances[i]?.instancePath);
        if (geppettoInstance) {
          let _check = await this.checkInstanceToRemove(geppettoInstance, sortedInstances[i], toRemove, pathsToRemove);
          if (_check) {
            sortedInstances.splice(i, 1);
          }
        } else {
          sortedInstances.splice(i, 1);
        }
      }
    } else {
      console.error("Give me an empty list if you want to wipe all the instances from the 3d viewer.");
      return [];
    }

    for (let child of toRemove) {
      this.meshFactory.cleanWith3DObject(child);
      this.scene.remove(child);
    }
    return sortedInstances;
  }

  updateInstancesColor (proxyInstances) {
    const sortedInstances = proxyInstances.sort((a, b) => {
      if (a.instancePath < b.instancePath) {
        return -1;
      }
      if (a.instancePath > b.instancePath) {
        return 1;
      }
      return 0;
    });
    for (const pInstance of sortedInstances) {
      if (pInstance.color) {
        this.setInstanceColor(pInstance.instancePath, pInstance.color);
      }
      if (pInstance.visualGroups) {
        const instance = Instances.getInstance(pInstance.instancePath);
        const visualGroups = this.getVisualElements(
          instance,
          pInstance.visualGroups
        );
        this.setSplitGroupsColor(pInstance.instancePath, visualGroups);
      }
    }
  }

  updateInstancesConnectionLines (proxyInstances) {
    for (const pInstance of proxyInstances) {
      const mode = pInstance.showConnectionLines ? pInstance.showConnectionLines : false
      this.showConnectionLines(pInstance.instancePath, mode);
    }
  }

  /**
   * Sets the color of the instances
   *
   * @param path
   * @param color
   */
  setInstanceColor (path, color) {
    const entity = Instances.getInstance(path);
    if (entity && this.setColorHandler(entity)) {
      if (entity instanceof Instance || entity instanceof ArrayInstance || entity instanceof SimpleInstance) {
        this.meshFactory.setColor(path, color);

        if (typeof entity.getChildren === 'function') {
          const children = entity.getChildren();
          for (let i = 0; i < children.length; i++) {
            this.setInstanceColor(children[i].getInstancePath(), color);
          }
        }
      } else if (entity instanceof Type || entity instanceof Variable) {
        // fetch all instances for the given type or variable and call hide on each
        const instances = ModelFactory.getAllInstancesOf(entity);
        for (let j = 0; j < instances.length; j++) {
          this.setInstanceColor(instances[j].getInstancePath(), color);
        }
      }
    }
  }

  /**
   *
   * @param instancePath
   * @param visualGroups
   */
  setSplitGroupsColor (instancePath, visualGroups) {
    for (const g in visualGroups) {
      // retrieve visual group object
      const group = visualGroups[g];

      // get full group name to access group mesh
      let groupName = g;
      if (groupName.indexOf(instancePath) <= -1) {
        groupName = instancePath + '.' + g;
      }

      // get group mesh
      const groupMesh = this.meshFactory.getMeshes()[groupName];
      groupMesh.visible = true;
      this.meshFactory.setThreeColor(groupMesh.material.color, group.color);
    }
  }

  updateGroupMeshes (proxyInstances) {
    for (const pInstance of proxyInstances) {
      if (pInstance.visualGroups) {
        const instance = Instances.getInstance(pInstance.instancePath);
        const visualGroups = this.getVisualElements(
          instance,
          pInstance.visualGroups
        );
        this.meshFactory.splitGroups(instance, visualGroups);
      }
    }
    const meshes = this.meshFactory.getMeshes();
    for (const meshKey in meshes) {
      this.addToScene(meshes[meshKey]);
    }
  }

  getVisualElements (instance, visualGroups) {
    const groups = {};
    if (visualGroups.index != null) {
      const vg = instance.getVisualGroups()[visualGroups.index];
      const visualElements = vg.getVisualGroupElements();
      const allElements = [];
      for (let i = 0; i < visualElements.length; i++) {
        if (visualElements[i].getValue() != null) {
          allElements.push(visualElements[i].getValue());
        }
      }

      let minDensity = Math.min.apply(null, allElements);
      let maxDensity = Math.max.apply(null, allElements);

      // highlight all reference nodes
      for (let j = 0; j < visualElements.length; j++) {
        groups[visualElements[j].getId()] = {};
        let color = visualElements[j].getColor();
        if (visualElements[j].getValue() != null) {
          let intensity = 1;
          if (maxDensity !== minDensity) {
            intensity
              = (visualElements[j].getValue() - minDensity)
              / (maxDensity - minDensity);
          }

          color = rgbToHex(
            255,
            Math.floor(255 - 255 * intensity),
            0
          );
        }
        groups[visualElements[j].getId()].color = color;
      }
    }

    for (const c in visualGroups.custom) {
      if (c in groups) {
        groups[c].color = visualGroups.custom[c].color;
      }
    }

    return groups;
  }
  /**
   * Show connection lines for this instance.
   *
   * @param instancePath
   * @param {boolean} mode - Show or hide connection lines
   */
  showConnectionLines (instancePath, mode) {
    if (mode == null) {
      mode = true;
    }
    const entity = Instances.getInstance(instancePath);
    if (entity instanceof Instance || entity instanceof ArrayInstance) {
      // show or hide connection lines
      if (mode) {
        this.showConnectionLinesForInstance(entity);
      } else {
        this.removeConnectionLines(entity);
      }
    } else if (entity instanceof Type || entity instanceof Variable) {
      // fetch all instances for the given type or variable and call hide on each
      const instances = ModelFactory.getAllInstancesOf(entity);
      for (let j = 0; j < instances.length; j++) {
        if (hasVisualType(instances[j])) {
          this.showConnectionLines(instances[j], mode);
        }
      }
    }
  }

  /**
   *
   *
   * @param instance
   */
  showConnectionLinesForInstance (instance) {
    const connections = instance.getConnections();

    const mesh = this.meshFactory.meshes[instance.getInstancePath()];
    const inputs = {};
    const outputs = {};
    const defaultOrigin = mesh.position.clone();

    for (let c = 0; c < connections.length; c++) {

      const connection = connections[c];
      const type = connection.getA().getPath() === instance.getInstancePath()
        ? Resources.OUTPUT
        : Resources.INPUT;

      const thisEnd = connection.getA().getPath() === instance.getInstancePath() ? connection.getA() : connection.getB();
      const otherEnd = connection.getA().getPath() === instance.getInstancePath() ? connection.getB() : connection.getA();
      const otherEndPath = otherEnd.getPath();

      const otherEndMesh = this.meshFactory.meshes[otherEndPath];

      let destination;
      let origin;

      if (thisEnd.getPoint() === undefined) {
        // same as before
        origin = defaultOrigin;
      } else {
        // the specified coordinate
        const p = thisEnd.getPoint();
        origin = new THREE.Vector3(p.x + mesh.position.x, p.y + mesh.position.y, p.z + mesh.position.z);
      }

      if (otherEnd.getPoint() === undefined) {
        // same as before
        destination = otherEndMesh.position.clone();
      } else {
        // the specified coordinate
        const p = otherEnd.getPoint();
        destination = new THREE.Vector3(p.x + otherEndMesh.position.x, p.y + otherEndMesh.position.y, p.z + otherEndMesh.position.z);
      }

      const geometry = new THREE.Geometry();

      geometry.vertices.push(origin, destination);
      geometry.verticesNeedUpdate = true;
      geometry.dynamic = true;

      let colour = null;


      if (type === Resources.INPUT) {

        colour = Resources.COLORS.INPUT_TO_SELECTED;

        // figure out if connection is both, input and output
        if (outputs[otherEndPath]) {
          colour = Resources.COLORS.INPUT_AND_OUTPUT;
        }

        if (inputs[otherEndPath]) {
          inputs[otherEndPath].push(connection.getInstancePath());
        } else {
          inputs[otherEndPath] = [];
          inputs[otherEndPath].push(connection.getInstancePath());
        }
      } else if (type === Resources.OUTPUT) {

        colour = Resources.COLORS.OUTPUT_TO_SELECTED;
        // figure out if connection is both, input and output
        if (inputs[otherEndPath]) {
          colour = Resources.COLORS.INPUT_AND_OUTPUT;
        }

        if (outputs[otherEndPath]) {
          outputs[otherEndPath].push(connection.getInstancePath());
        } else {
          outputs[otherEndPath] = [];
          outputs[otherEndPath].push(connection.getInstancePath());
        }
      }

      const material = new THREE.LineDashedMaterial({ dashSize: 3, gapSize: 1 });
      this.meshFactory.setThreeColor(material.color, colour);

      const line = new THREE.LineSegments(geometry, material);
      line.updateMatrixWorld(true);


      if (this.meshFactory.connectionLines[connection.getInstancePath()]) {
        this.scene.remove(this.meshFactory.connectionLines[connection.getInstancePath()]);
      }

      this.scene.add(line);
      this.meshFactory.connectionLines[connection.getInstancePath()] = line;
    }
  }

  /**
   * Removes connection lines, all if nothing is passed in or just the ones passed in.
   *
   * @param instance - optional, instance for which we want to remove the connections
   */
  removeConnectionLines (instance) {
    if (instance !== undefined) {
      const connections = instance.getConnections();
      // get connections for given instance and remove only those
      const lines = this.meshFactory.connectionLines;
      for (let i = 0; i < connections.length; i++) {
        if (Object.prototype.hasOwnProperty.call(lines, connections[i].getInstancePath())) {
          // remove the connection line from the scene
          this.scene.remove(lines[connections[i].getInstancePath()]);
          // remove the conneciton line from the GEPPETTO list of connection lines
          delete lines[connections[i].getInstancePath()];
        }
      }
    } else {
      // remove all connection lines
      const lines = this.meshFactory.connectionLines;
      for (var key in lines) {
        if (Object.prototype.hasOwnProperty.call(lines, key)) {
          this.scene.remove(lines[key]);
        }
      }
      this.meshFactory.connectionLines = [];
    }
  }

  mouseDownEventListener = (event) => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
  }

  mouseUpEventListener = (event) => {
    if (event.target === this.renderer.domElement) {
      const x = event.clientX;
      const y = event.clientY;

      // if the mouse moved since the mousedown then don't consider this a selection
      if (
        typeof this.clientX === 'undefined'
        || typeof this.clientY === 'undefined'
        ||  x !== this.clientX
        || y !== this.clientY
      ) {
        return;
      }

      this.mouse.y
      = -(
        (event.clientY
        - this.renderer.domElement.getBoundingClientRect().top)
        / this.renderer.domElement.getBoundingClientRect().height
      ) *2 + 1;

      this.mouse.x
      = ((event.clientY
        - this.renderer.domElement.getBoundingClientRect().left)
        / this.renderer.domElement.getBoundingClient().width) * 2 - 1;

      if (event.button === 0) {
        // only for left click
        if (this.pickingEnabled) {
          const intersects = this.getIntersectedObjects();

          if (intersects.length > 0) {
            // sort intersects
            const compare = function (a, b) {
              if (a.distance < b.distance) {
                return -1;
              }
              if (a.distance > b.distance) {
                return 1;
              }
              return 0;
            }
          }
          intersects.sort(compare);

          let selectedMap = {};
          // Iterate and get the first visible item (they are now ordered by proximity)
          for (let i = 0; i < intersects.length; i++) {
            // figure out if the entity is visible
            let instancePath = '';
            let geometryIdentifier = '';
            if (
              Object.prototype.hasOwnProperty.call(
                intersects[i].object,
                'instancePath'
              )
            ) {
              instancePath = intersects[i].object.instancePath;
              geometryIdentifier
              = intersects[i].object.geometryIdentifier;
            }
            else {
              instancePath = intersects[i].object.parent.instancePath;
              geometryIdentifier
              = intersects[i].object.parent.geometryIdentifier;
            }

            if (
              (instancePath != null
                && Object.prototype.hasOwnProperty.call(
                  this.meshFactory.meshes,
                  instancePath
                ))
              || Object.prototype.hasOwnProperty.call(
                this.meshFactory.splitMeshes,
                instancePath
              )
            ) {
              if (!(instancePath in selectedMap)) {
                selectedMap[instancePath] = {
                  ...intersects[i],
                  geometryIdentifier: geometryIdentifier,
                  distanceIndex: i,
                };
              }
            }
          }
          this.requestFrame();
          // this.onSelection(this.selectionStrategy(selectedMap))
        }
      }
    }
  }

  mouseMoveEventListener = (event) => {
    this.mouse.y
    = -(
      (event.clientY
        - this.renderer.domElement.getBoundingClientRect().top)
        / this.renderer.domElement.height
    )
    * 2 + 1;

    this.mouse.x
    = ((event.clientX
      - this.renderer.domElement.getBoundingClientRect().left)
      / this.renderer.domElement.width)
      * 2 - 1;

    this.mouseContainer.x = event.clientX;
    this.mouseContainer.y = event.clientY;

    this.mouseRayCaster.x = (event.clientX / this.renderer.domElement.width) * 2 - 1;
    this.mouseRayCaster.y = - (event.clientY / this.renderer.domElement.height) * 2 + 1;

    if (this.hoverListeners && this.hoverListeners.length  > 0) {
      const intersects = this.getIntersectedObjects();
      for (const listener in this.hoverListeners) {
        if (intersects.length !== 0) {
          this.hoverListeners[listener](intersects, this.mouseContainer.x, this.mouseContainer.y);
        }
      }
    }
  }
  /**
   * Set up the listeners use to detect mouse movement and window resizing
   */
  setupListeners = (onSelection) => {
    console.log('inside set up listeners');
    this.controls.addEventListener('start', this.requestFrameBounding);
    this.controls.addEventListener('change', this.requestFrameBounding);
    this.controls.addEventListener('stop', this.stop);
    // when the mouse moves, call the given function
    this.renderer.domElement.addEventListener(
      'mousedown',
      this.controls.mouseDownEventListener,
      false
    );

    // when the mouse moves, call the given function
    this.renderer.domElement.addEventListener(
      'mouseup',
      this.mouseUpEventListener,
      false
    );

    this.renderer.domElement.addEventListener(
      'mousemove',
      this.mouseMoveEventListener,
      false
    );
  }

  /**
   * Sets whether to use wireframe for the materials of the meshes
   * @param wireframe
   */
  setWireframe (wireframe) {
    this.wireframe = wireframe;
    const that = this;
    this.scene.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        if (!(child.material.nowireframe === true)) {
          child.material.wireframe = that.wireframe;
        }
      }
    });
  }

  setBackgroundColor (color) {
    this.scene.background.getHex()
    let newColor = new THREE.Color(color);
    if (this.scene.background.getHex() !== newColor.getHex()) {
      this.scene.background = newColor;
    }
  }

  async update (proxyInstances, cameraOptions, threeDObjects, toTraverse, newBackgroundColor) {
    this.setBackgroundColor(newBackgroundColor);
    proxyInstances = await this.clearScene(proxyInstances);
    // Todo: resolve proxyInstances to populate child meshes
    if (toTraverse) {
      await this.addInstancesToScene(proxyInstances);
      threeDObjects.forEach(element => {
        this.addToScene(element);
      });
      this.updateInstancesColor(proxyInstances);
      this.updateInstancesConnectionLines(proxyInstances);
      this.scene.updateMatrixWorld(true);
    }
    // TODO: only update camera when cameraOptions changes
    this.cameraManager.update(cameraOptions);
  }

  addToScene (instance) {
    let found = false;
    for (let child of this.scene.children) {
      if (((instance.instancePath) && (instance.instancePath === child.instancePath)) || (child.uuid === instance.uuid)) {
        found = true;
        break;
      }
    }
    if (!found) {
      this.scene.add(instance);
    }
  }

  resize () {
    this.width = this.containerRef.clientWidth;
    this.height = this.containerRef.clientHeight;
    this.cameraManager.camera.aspect = this.width / this.height;
    this.cameraManager.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  start (proxyInstances, cameraOptions, toTraverse) {
    this.resize();
    this.update(proxyInstances, cameraOptions, [], toTraverse);
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.animate);
    }
  }

  requestFrame () {
    const timeDif = this.lastRenderTimer.getTime() - new Date().getTime();
    if (Math.abs(timeDif) > 10) {
      this.lastRenderTimer = new Date() ;
      this.frameId = window.requestAnimationFrame(this.animate);
    }

  }

  animate () {
    this.controls.update();
    this.renderScene();
  }

  updateControls () {
    this.controls.update();
  }

  renderScene () {
    this.renderer.render(this.scene, this.cameraManager.getCamera());
  }

  stop () {
    cancelAnimationFrame(this.frameId);
  }

  /**
   * Returns the scene renderer
   * @returns renderer
   */
  getRenderer () {
    return this.renderer;
  }
  /**
   * Returns the scene
   * @returns scene
   */
  getScene () {
    return this.scene;
  }
  /**
   * Returns the wireframe flag
   * @returns wireframe
   */
  getWireframe () {
    return this.wireframe;
  }
}
