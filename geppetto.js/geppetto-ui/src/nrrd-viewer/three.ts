import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader'
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader'
import { GUI } from 'dat.gui'

export type InitRenderArgs = {
	nrrdUrls: string[];
	appendDOMElement: (element: any) => void;
}

// Creating renderer
const renderer = new THREE.WebGLRenderer();
// Creating scene
const scene = new THREE.Scene();
//Assign size and aspect 
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
const aspect = sizes.width / sizes.height;
// Creating camera
const camera = new THREE.PerspectiveCamera( 45, aspect, 1, 1000 );
// Create controls
const	controls = new OrbitControls( camera, renderer.domElement );
// The gui for interaction
const volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
const gui = new GUI();
// Creating nrrd-viewer
const nrrdloader = new NRRDLoader();
// Colormap textures
const cmtextures = {
	viridis: new THREE.TextureLoader().load( 'https://raw.githubusercontent.com/mrdoob/three.js/106528bdee752417285d53904e5d60eeef7fa427/examples/textures/cm_viridis.png'),
	gray: new THREE.TextureLoader().load( 'https://raw.githubusercontent.com/mrdoob/three.js/106528bdee752417285d53904e5d60eeef7fa427/examples/textures/cm_gray.png')
};

// Material
const shader = VolumeRenderShader1;
const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
const material = new THREE.ShaderMaterial( {
	uniforms: uniforms,
	vertexShader: shader.vertexShader,
	fragmentShader: shader.fragmentShade,
	side: THREE.BackSide // The volume shader uses the backface as its "reference point"
} );


function render() {
	console.log("Renderer");
	renderer.render( scene, camera );

}

export default {
  renderer,
  scene,
  camera,
	gui,
	controls,
	volconfig,
	cmtextures,
	nrrdloader,
	uniforms,
	material,
	shader,
	sizes,
	updateUniforms: function() {

		this.material.uniforms[ 'u_clim' ].value.set( this.volconfig.clim1, this.volconfig.clim2 );
		this.material.uniforms[ 'u_clim' ].value.set( this.volconfig.clim1, this.volconfig.clim2 );
		this.material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
		this.material.uniforms[ 'u_renderstyle' ].value = this.volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
		this.material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
		this.material.uniforms[ 'u_renderthreshold' ].value = this.volconfig.isothreshold; // For ISO renderstyle
		this.material.uniforms[ 'u_cmdata' ].value = this.cmtextures[ volconfig.colormap ];
		this.material.uniforms[ 'u_cmdata' ].value = this.cmtextures[ this.volconfig.colormap ];

		render();

	},
	onWindowResize: function () {

		this.renderer.setSize( this.sizes.width, this.sizes.height );

		const frustumHeight = this.camera.top - this.camera.bottom;

		this.camera.left = - frustumHeight * aspect / 2;
		this.camera.right = frustumHeight * aspect / 2;

		this.camera.updateProjectionMatrix();

		render();

	},
	init: function (nrrdUrls: string[], appendDOMElement: (ele) => void) {
		console.log("Test")

		// Set renderer values
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		appendDOMElement( this.renderer.domElement );

		// Create camera (The volume renderer does not work very well with perspective yet)
		const h = 512; // frustum height
		// camera = new THREE.PerspectiveCamera( 45, aspect, 1, 1000 );
		this.camera.position.set( - 64, - 64, 128 );
		this.camera.up.set( 0, 0, 1 ); // In our data, z is up

		// Create controls
		this.controls.addEventListener( 'change', render );
		this.controls.target.set( 64, 64, 128 );
		this.controls.minZoom = 0.5;
		this.controls.maxZoom = 4;
		this.controls.enablePan = false;
		this.controls.update();

		// this.scene.add( new AxesHelper( 128 ) );

		// Lighting is baked into the shader a.t.m.
		// let dirLight = new DirectionalLight( 0xffffff );

		// The gui for interaction
		this.gui.add( this.volconfig, 'clim1', 0, 1, 0.01 ).onChange( this.updateUniforms );
		this.gui.add( this.volconfig, 'clim1', 0, 1, 0.01 ).onChange( this.updateUniforms );
		this.gui.add( this.volconfig, 'clim2', 0, 1, 0.01 ).onChange( this.updateUniforms );
		this.gui.add( this.volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( this.updateUniforms );
		this.gui.add( this.volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( this.updateUniforms );
		this.gui.add( this.volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( this.updateUniforms );
		

		
		nrrdUrls.forEach( example => {
		// Load the data ...
		this.nrrdloader.load(example, function ( volume ) {
			console.log("Load nrrd ", volume);
			const texture = new THREE.Data3DTexture( volume.data, volume.xLength, volume.yLength, volume.zLength );
			texture.format = THREE.RedFormat;
			texture.minFilter = texture.magFilter = THREE.LinearFilter;
			// texture.type = THREE.FloatType;
			texture.unpackAlignment = 1;
			texture.needsUpdate = true;

			// Material
			// const shader = VolumeRenderShader1;

			// const uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			this.uniforms[ 'u_data' ].value = texture;
			this.uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength );
			this.uniforms[ 'u_clim' ].value.set( this.volconfig.clim1, this.volconfig.clim2 );
			this.uniforms[ 'u_renderstyle' ].value = this.volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
			this.uniforms[ 'u_renderthreshold' ].value = this.volconfig.isothreshold; // For ISO renderstyle
			this.uniforms[ 'u_cmdata' ].value = this.cmtextures[ this.volconfig.colormap ];

			// material = new THREE.ShaderMaterial( {
			// 	uniforms: uniforms,
			// 	vertexShader: shader.vertexShader,
			// 	fragmentShader: shader.fragmentShader,
			// 	side: THREE.BackSide // The volume shader uses the backface as its "reference point"
			// } );

			// THREE.Mesh
			const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength );
			geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 );

			const mesh = new THREE.Mesh( geometry, material );
			
			const box = new THREE.BoxHelper( mesh, 0xffff00 );
			const group = new THREE.Group();
			group.add( box );
			group.add( mesh );
			
			this.scene.add( group );

			console.log("Scene ", this.scene);
			console.log("Mesh ", mesh);
			render();

		} );
		});

		window.addEventListener( 'resize', this.onWindowResize );

	}
}