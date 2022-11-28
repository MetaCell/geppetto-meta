import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader';
import { GUI } from 'dat.gui';

function getSelectorObj(files) {
  return files.reduce((acc, cur) => {
    if (!acc) return;
    if (cur !== undefined) {
      return acc[cur.name] = cur.id
    }

  }, {})
}

export default class NRRDThreeDEngine {
  constructor(files, containerRef, guiRef, cameraOptions, backgroundColor) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(backgroundColor);
    this.camera = null;
    this.cameraOptions = cameraOptions;
    // this.onSelection = onSelection;
    this.renderer = null;
    this.gui = null;
    this.controls = null;
    this.instances = {};
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

    // Setup Camera
    this.setupCamera(this.width / this.height);

    // Setup GUI
    this.setupGUI(this.defaultVolconfig, this.updateUniforms);

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
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.camera.position.set(-64, -64, 128);
    this.camera.up.set(0, 0, 1); // In our data, z is up
    console.log('1');
  }

  /**
   * Setups the renderer
   * @param containerRef
   */
  setupRenderer(containerRef, guiRef, options) {
    console.log('2', containerRef, guiRef);
    this.renderer = new THREE.WebGLRenderer(options);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
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
   * Setups controls
   * @param volconfig
   * @param updateUniforms
   */
  setupGUI(volconfig, updateUniforms) {
    this.gui = new GUI({ autoPlace: false });

    // The gui for interaction
    // gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
    this.gui.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
    this.gui.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
    this.gui.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
    this.gui.add(volconfig, 'clim2', 0, 1, 0.01).onChange(updateUniforms);
    this.gui
      .add(volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' })
      .onChange(updateUniforms);
    this.gui
      .add(volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' })
      .onChange(updateUniforms);
    this.gui
      .add(volconfig, 'isothreshold', 0, 1, 0.01)
      .onChange(updateUniforms);
  }

  /**
   * Setups controls
   * @param volconfig
   * @param updateUniforms
   */
  updateGUI(volconfig, updateUniforms) {
    // The gui for interaction
    this.gui.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
    this.gui.add(volconfig, 'clim1', 0, 1, 0.01).onChange(updateUniforms);
    this.gui.add(volconfig, 'clim2', 0, 1, 0.01).onChange(updateUniforms);
    this.gui
      .add(volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' })
      .onChange(updateUniforms);
    this.gui
      .add(volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' })
      .onChange(updateUniforms);
    this.gui
      .add(volconfig, 'isothreshold', 0, 1, 0.01)
      .onChange(updateUniforms);
    this.gui.updateDisplay();
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
   * @returns scene
   */
  getScene() {
    return this.scene;
  }

  updateUniforms() {
    // material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    // material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    // material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
    // material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
    // material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    // material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    // material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
    // material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

    this.renderScene();
  }

  /**
   * Returns the scene
   * @param volume
   */
  onLoad(volume, fileObj) {
    console.log('Load nrrd ', volume);
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
      id: fileObj.id,
      url: fileObj.url,
      material,
      uniforms,
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
      await this.nrrdloader.load(nrrd.url, (volume) =>
        this.onLoad(volume, nrrd)
      );
    }
  }

  // async updateInstances (instances) {
  //   await this.addInstancesToLoader(instances);
  // }
}
