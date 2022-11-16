import React, { useEffect, useRef, useState } from 'react'
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
// import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader';
// import { GUI } from 'dat.gui'
import ReactResizeDetector from 'react-resize-detector';
import T3, { InitRenderArgs } from './three';

const example1 = "https://v2.virtualflybrain.org/data/VFB/i/0010/12vj/VFB_00101567/volume.nrrd";
const example2 = "https://v2.virtualflybrain.org/data/VFB/i/0010/1567/VFB_00101567/volume.nrrd";
const example3 = "https://v2.virtualflybrain.org/data/VFB/i/0010/101b/VFB_00101567/volume.nrrd";

let examples = [example1, example2, example3];

interface INRRDViewerProps extends InitRenderArgs {
	skipOnMount: boolean
	onResize?: (width?: number, height?: number) => void
}

const NRRDViewer = ({nrrdUrls = examples, onResize, skipOnMount= true}: INRRDViewerProps) => {
	const mountRef = useRef(null);

	// append renderer to dom element ref (renderer.domElement)

	function appendDomElement(element) {
		mountRef.current.appendChild(element);
	}

	useEffect(() => {
		T3.init(nrrdUrls, appendDomElement);
		return () => mountRef.current.removeChild( T3.renderer.domElement );
	}, [])



	return (
		<ReactResizeDetector skipOnMount={skipOnMount} onResize={onResize}>
			<div ref={mountRef} />
		</ReactResizeDetector>
	);
}


export default NRRDViewer;