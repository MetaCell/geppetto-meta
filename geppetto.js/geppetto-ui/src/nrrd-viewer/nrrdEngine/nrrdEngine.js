import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader'
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader'
import { GUI } from 'dat.gui'

// Creating renderer
export const renderer = new THREE.WebGLRenderer();
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
	fragmentShader: shader.fragmentShader,
	side: THREE.BackSide // The volume shader uses the backface as its "reference point"
} );


function render() {
	console.log("Renderer");
	renderer.render( scene, camera );

}

console.log('uniforms1 ===', uniforms);

export function updateUniforms() {
	material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
	material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
	material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
	material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
	material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
	material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
	material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
	material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

	render();

}

export function onWindowResize() {
	renderer.setSize( sizes.width, sizes.height );

	const frustumHeight = camera.top - camera.bottom;

	camera.left = - frustumHeight * aspect / 2;
	camera.right = frustumHeight * aspect / 2;
	camera.updateProjectionMatrix();

	render();
}


export function init3DObject(nrrdUrls, appendDOMElement) {
	console.log("Test")
	console.log('uniforms2 ===', uniforms);

	// Set renderer values
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	appendDOMElement( renderer.domElement );

	// Create camera (The volume renderer does not work very well with perspective yet)
	const h = 512; // frustum height
	// camera = new THREE.PerspectiveCamera( 45, aspect, 1, 1000 );
	camera.position.set( - 64, - 64, 128 );
	camera.up.set( 0, 0, 1 ); // In our data, z is up

	// Create controls
	controls.addEventListener( 'change', render );
	controls.target.set( 64, 64, 128 );
	controls.minZoom = 0.5;
	controls.maxZoom = 4;
	controls.enablePan = false;
	controls.update();

	// scene.add( new AxesHelper( 128 ) );

	// Lighting is baked into the shader a.t.m.
	// let dirLight = new DirectionalLight( 0xffffff );

	// The gui for interaction
	gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
	gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
	gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
	gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( updateUniforms );
	gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
	gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );
	

	
	nrrdUrls.forEach( example => {
	// Load the data ...
	nrrdloader.load(example, function (volume) {

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
		console.log('uniforms2 ===', uniforms);

		uniforms[ 'u_data' ].value = texture;
		uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength );
		uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
		uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
		uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
		uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

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
		
		scene.add( group );

		console.log("Scene ", scene);
		console.log("Mesh ", mesh);
		render();

	} );
	});

	window.addEventListener( 'resize', onWindowResize );

}