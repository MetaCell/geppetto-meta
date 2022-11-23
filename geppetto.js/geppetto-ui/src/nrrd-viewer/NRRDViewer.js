import React, { useEffect, useRef } from 'react'
import ReactResizeDetector from 'react-resize-detector';
import { renderer, init3DObject } from './nrrdEngine/nrrdEngine';
import PropTypes from 'prop-types';

const example1 = "https://v2.virtualflybrain.org/data/VFB/i/0010/12vj/VFB_00101567/volume.nrrd";
const example2 = "https://v2.virtualflybrain.org/data/VFB/i/0010/1567/VFB_00101567/volume.nrrd";
const example3 = "https://v2.virtualflybrain.org/data/VFB/i/0010/101b/VFB_00101567/volume.nrrd";

let examples = [
	{id: 'example1' , url: example1},  
	{id: 'example2', url: example2}, 
	{id: 'example3', url: example3}
];

const NRRDViewer = ({ files, onResize, skipOnMount = true }) => {
	const mountRef = useRef(null);

	// append renderer to dom element ref (renderer.domElement)
	function appendDomElement(element) {
			mountRef.current.appendChild(element);
	}

	useEffect(() => {
		init3DObject(files, appendDomElement);
		return () => {
			mountRef.current.removeChild(renderer.domElement);
		}
	}, [])



	return (
		<ReactResizeDetector skipOnMount={skipOnMount} onResize={onResize}>
			<div ref={mountRef} />
		</ReactResizeDetector>
	);
}

NRRDViewer.defaultValues = {
	files: examples,
	skipOnMount: true,
	onResize: () => {}
}

NRRDViewer.propTypes = {
	/**
   * URLs pointing to the nrrd files to be rendered in this component.
   */
	files: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired
	})).isRequired,

	/**
 * Boolean value indicating if the nnrd loader should skip on mount . Defaults to false.
 */
	skipOnMount : PropTypes.bool,
/**
 * Function to callback on model resize
 */
onResize: PropTypes.func
};

export default NRRDViewer;