import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader';
import { GUI } from 'dat.gui';

function getSelectorObj(files) {
  return files.reduce((acc, cur) => {
    if (!acc) return;
    if (cur !== undefined) {
      acc[cur.name] = cur.id;
      return acc;
    }
  }, {});
}

export default class NRRDThreeDEngine {
  constructor(
    files,
    containerRef,
    guiRef,
    cameraOptions,
    backgroundColor,
    selectedInstanceId
  ) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(backgroundColor);
    this.camera = null;
    this.cameraOptions = cameraOptions;
    this.renderer = null;
    this.gui = null;
    this.controls = null;
    this.instances = {};
    this.selectedInstanceId = selectedInstanceId;
    this.nrrdloader = new NRRDLoader();
    this.files = files;
    this.guiRef = guiRef;
    this.containerRef = containerRef;
    this.width = containerRef?.clientWidth;
    this.height = containerRef?.clientHeight;
    this.defaultVolconfig = {
      clim1: 0,
      clim2: 1,
      renderstyle: 'iso',
      isothreshold: 0.15,
      colormap: 'viridis',
    };
    this.cmtextures = {
      viridis: new THREE.TextureLoader().load(
        'https://raw.githubusercontent.com/mrdoob/three.js/106528bdee752417285d53904e5d60eeef7fa427/examples/textures/cm_viridis.png'
      ),
      gray: new THREE.TextureLoader().load(
        'https://raw.githubusercontent.com/mrdoob/three.js/106528bdee752417285d53904e5d60eeef7fa427/examples/textures/cm_gray.png'
      ),
    };

    // this.updateInstances = this.updateInstances.bind(this);
    this.addInstancesToLoader = this.addInstancesToLoader.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.setupRenderer = this.setupRenderer.bind(this);
    this.setupListeners = this.setupListeners.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.updateUniforms = this.updateUniforms.bind(this);
    this.updateSelectedInstanceId = this.updateSelectedInstanceId.bind(this);

    // Setup Camera
    this.setupCamera(this.width / this.height);

    // Setup GUI
    this.setupGUI();

    // Setup Renderer
    this.setupRenderer(this.containerRef, this.guiRef, {});

    // Setup Controls
    this.setupControls();

    // Add nrrd files to loader
    this.addInstancesToLoader(this.files);

    // Setup Listeners
    this.setupListeners();
  }

  /**
   * Setups the camera
   * @param aspect
   */
  setupCamera(aspect) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 100000);
    this.camera.position.set(-64, -64, 128);
    this.camera.up.set(0, 0, 1); // In our data, z is up
  }

  /**
   * Setups the renderer
   * @param containerRef
   */
  setupRenderer(containerRef, guiRef, options) {
    this.renderer = new THREE.WebGLRenderer(options);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = true;
    containerRef.appendChild(this.renderer.domElement);
    guiRef.appendChild(this.gui.domElement);
    // this.configureRenderer(false);
  }

  /**
   * Setups controls
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Create controls
    this.controls.addEventListener('change', this.renderScene);
    this.controls.target.set(64, 64, 128);
    this.controls.minZoom = 0.5;
    this.controls.maxZoom = 4;
    this.controls.enablePan = false;
    this.controls.update();
  }

  /**
   * Set up the listeners use to detect mouse movement and window resizing
   */
  setupListeners = () => {
    // window.addEventListener('resize', this.onWindowResize);
    this.containerRef.addEventListener('resize', this.onWindowResize);
  };

  /**
   * Setups GUI
   */
  setupGUI() {
    this.gui = new GUI({ autoPlace: false });
  }

  updateUniforms() {
    const currentInstance = this.instances[this.selectedInstanceId];

    if (currentInstance) {
      currentInstance.material.uniforms['u_clim'].value.set(
        currentInstance.volconfig.clim1,
        currentInstance.volconfig.clim2
      );
      currentInstance.material.uniforms['u_renderstyle'].value =
        currentInstance.volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
      currentInstance.material.uniforms['u_renderthreshold'].value =
        currentInstance.volconfig.isothreshold; // For ISO renderstyle
      currentInstance.material.uniforms['u_cmdata'].value =
        currentInstance.cmtextures[currentInstance.volconfig.colormap];
    }

    this.renderScene();
  }

  /**
   * Updates GUI
   * @param volconfig
   * @param updateUniforms
   * @param name
   * @param liveName
   */
  updateGUI(volconfig, updateUniforms, name, liveName) {
    if (liveName && this.gui.__folders[liveName]) {
      this.gui.removeFolder(this.gui.__folders[liveName]);
    }
    // The gui for interaction when instance has loaded
    if (Object.keys(this.instances).length > 0 && name) {
      const folder = this.gui.addFolder(name);
      // folder.folder.open();
      folder.open();
      folder.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
      folder.add(volconfig, 'clim2', 0, 1, 0.01).onChange(updateUniforms);
      folder
        .add(volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' })
        .onChange(updateUniforms);
      folder
        .add(volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' })
        .onChange(updateUniforms);
      folder
        .add(volconfig, 'isothreshold', 0, 1, 0.01)
        .onChange(updateUniforms);
      // folder.updateDisplay();
    }
  }

  /**
   * Update selected instance
   * @param instanceId
   */
  updateSelectedInstanceId(instanceId, prevId) {
    this.selectedInstanceId = instanceId;

    // update GUI
    if (Object.keys(this.instances).length > 0 && this.instances[instanceId]) {
      const currentInstance = this.instances[instanceId];
      const prevInstance = this.instances[prevId];

      this.updateGUI(
        currentInstance.volconfig,
        this.updateUniforms,
        currentInstance.name,
        prevId ? prevInstance.name : null
      );
    }
  }

  animate() {
    this.controls.update();
    this.renderScene();
  }

  updateControls() {
    this.controls.update();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.renderer.setSize(this.width, this.height);

    const frustumHeight = camera.top - camera.bottom;

    this.camera.left = (-frustumHeight * aspect) / 2;
    this.camera.right = (frustumHeight * aspect) / 2;
    this.camera.updateProjectionMatrix();

    this.renderScene();
  }

  /**
   * Returns the scene renderer
   * @returns renderer
   */
  getRenderer() {
    return this.renderer;
  }
  /**
   * Returns the scene
   * @returns scene
   */
  getScene() {
    return this.scene;
  }
  /**
   * Returns the gui
   * @returns gui
   */
  getGUI() {
    return this.gui;
  }

  /**
   * Returns the scene
   * @param volume
   */
  onLoad(volume, fileObj) {
    console.log('Load nrrd ', volume, fileObj);
    const texture = new THREE.Data3DTexture(
      volume.data,
      volume.xLength,
      volume.yLength,
      volume.zLength
    );
    texture.format = THREE.RedFormat;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    // texture.type = THREE.FloatType;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;

    // Material
    const shader = VolumeRenderShader1;
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['u_data'].value = texture;
    uniforms['u_size'].value.set(
      volume.xLength,
      volume.yLength,
      volume.zLength
    );
    uniforms['u_clim'].value.set(
      this.defaultVolconfig.clim1,
      this.defaultVolconfig.clim2
    );
    uniforms['u_renderstyle'].value =
      this.defaultVolconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
    uniforms['u_renderthreshold'].value = this.defaultVolconfig.isothreshold; // For ISO renderstyle
    uniforms['u_cmdata'].value =
      this.cmtextures[this.defaultVolconfig.colormap];

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide, // The volume shader uses the backface as its "reference point"
    });

    // THREE.Mesh
    const geometry = new THREE.BoxGeometry(
      volume.xLength,
      volume.yLength,
      volume.zLength
    );
    geometry.translate(
      volume.xLength / 2 - 0.5,
      volume.yLength / 2 - 0.5,
      volume.zLength / 2 - 0.5
    );
    // Add nrrd obj to instance e.g material, uniform
    this.instances[fileObj.id] = {
      ...fileObj,
      material,
      uniforms,
      volconfig: { ...this.defaultVolconfig },
      cmtextures: { ...this.cmtextures },
    };

    const mesh = new THREE.Mesh(geometry, material);

    const box = new THREE.BoxHelper(mesh, 0xffff00);
    const group = new THREE.Group();
    group.add(box);
    group.add(mesh);

    this.scene.add(group);

    console.log('Scene ', this.scene);
    console.log('Mesh ', mesh);
    this.renderScene();
  }

  /**
   * Adds nrrd files to the NRRD Loader
   * @param instances
   */
  async addInstancesToLoader(instances) {
    for (const nrrd of instances) {
      this.nrrdloader.load(nrrd.url, async (volume) => {
        await this.onLoad(volume, nrrd);
        // this.gui.updateDisplay();
      });
    }
  }

  // async updateInstances (instances) {
  //   await this.addInstancesToLoader(instances);
  // }
}
