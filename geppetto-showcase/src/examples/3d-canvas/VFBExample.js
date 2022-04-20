import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import * as THREE from 'three';
import Loader from "@metacell/geppetto-meta-ui/loader/Loader";
import Button from "@material-ui/core/Button";
import { applySelection, mapToCanvasData } from "@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils"
import Manager from '@metacell/geppetto-meta-core/ModelManager';

const INSTANCES = [
  'VFB_00017894',
  'VFB_00030624',
  'VFB_00030622',
  'VFB_00030616',
  'VFB_00030633',
  'VFB_00030840',
  'VFB_00030632',
  'VFB_00030783',
];
const COLORS = [
  { r: 0.36, g: 0.36, b: 0.36, a: 1 },
  { r: 0, g: 1, b: 0, a: 1 },
  { r: 1, g: 0, b: 1, a: 1 },
  { r: 0, g: 0, b: 1, a: 1 },
  { r: 1, g: 0.83, b: 0, a: 1 },
  { r: 0, g: 0.52, b: 0.96, a: 1 },
  { r: 1, g: 0, b: 0, a: 1 },
];
const styles = () => ({
  container: {
    height: '800px',
    width: '1240px',
    display: 'flex',
    alignItems: 'stretch',
  },
});

class VFBExample extends Component {
  constructor (props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      showLoader: false,
      hasModelLoaded: false,
      data: [
        {
          instancePath: 'VFB_00017894',
          color: COLORS[0],
        },
        {
          instancePath: 'VFB_00030616',
          color: COLORS[2],
        },
        {
          instancePath: 'VFB_00030633',
          color: COLORS[3],
        },
        {
          instancePath: 'VFB_00030840',
          color: COLORS[4],
        },
        {
          instancePath: 'VFB_00030632',
          color: COLORS[5],
        },
        { instancePath: 'VFB_00030624' },
        {
          instancePath: 'VFB_00030783',
          color: COLORS[6],
        },
      ],
      selected: {},
      threeDObjects: [],
      cameraOptions: {
        initialPosition: { x: 319.7, y: 153.12, z: -494.2 },
        initialRotation: { rx: -3.14, ry: 0, rz: -3.14, radius: 559.83 },
        initialFlip: ['y', 'z'],
        cameraControls: {
          instance: CameraControls,
          props: { wireframeButtonEnabled: true, }
        },
        rotationSpeed: 3,
      }
    };
    this.onSelection = this.onSelection.bind(this)
    this.onMount = this.onMount.bind(this);
    this.hoverHandler = this.hoverHandler.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside (event) {
    if (this.node && !this.node.contains(event.target)) {
      if (event.offsetX <= event.target.clientWidth) {
        this.setState({ hasModelLoaded: false })
      }
    }
  }

  /**
   * Add a 3D plane to the scene at the given coordinates (4) points.
   * It could be any geometry really.
   * @returns {THREE.Mesh}
   */
  get3DPlane (x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(x1, y1, z1),// vertex0
      new THREE.Vector3(x2, y2, z2),// 1
      new THREE.Vector3(x3, y3, z3),// 2
      new THREE.Vector3(x4, y4, z4)// 3
    );
    geometry.faces.push(
      new THREE.Face3(2, 1, 0),// use vertices of rank 2,1,0
      new THREE.Face3(3, 1, 2)// vertices[3],1,2...
    );
    geometry.computeBoundingBox();

    const max = geometry.boundingBox.max,
      min = geometry.boundingBox.min;
    const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    const faces = geometry.faces;

    geometry.faceVertexUvs[0] = [];

    for (let i = 0; i < faces.length; i++) {

      const v1 = geometry.vertices[faces[i].a],
        v2 = geometry.vertices[faces[i].b],
        v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
        new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
        new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
      ]);
    }
    geometry.uvsNeedUpdate = true;
    geometry.dynamic = true;

    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    material.nowireframe = true;

    material.opacity = 0.3;
    material.transparent = true;
    material.color.setHex("0xb0b0b0");

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
    mesh.clickThrough = true;
    return mesh;
  }

  onMount (scene) {
    const bb = new THREE.Box3().setFromObject(scene);
    const plane = this.get3DPlane(bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z)
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    this.setState(() => ({ threeDObjects: [plane] }));

  }

  async handleToggle () {
    this.setState({ showLoader: true })

    const response = await fetch('../assets/vfb_model.json');
    const model = await response.json();
    Manager.loadModel(model);
    for (const iname of INSTANCES) {
      Instances.getInstance(iname);
    }
    this.setState({ hasModelLoaded: true, showLoader: false })
  }

  onSelection (selectedInstances){
    this.setState({ data: applySelection(this.state.data, selectedInstances) })
  }

  hoverHandler (objs, canvasX, canvasY) {

  }

  render () {
    const { classes } = this.props;
    const { data, threeDObjects, hasModelLoaded, showLoader, cameraOptions } = this.state;
    const canvasData = mapToCanvasData(data)
    
    return showLoader ? <Loader active={true}/> : hasModelLoaded ? (
      <div ref={node => this.node = node} className={classes.container}>
        <>
          <Canvas
            ref={this.canvasRef}
            data={canvasData}
            threeDObjects={threeDObjects}
            cameraOptions={cameraOptions}
            onMount={this.onMount}
            onSelection={this.onSelection}
            linesThreshold={10000}
            backgroundColor={0x505050}
            onHoverListeners={{ 'hoverId':this.hoverHandler }}
          />
        </>
      </div>
    ) : <Button
      variant="outlined"
      color="primary"
      onClick={this.handleToggle}
    >
            Show Example
    </Button>
  }
}

export default withStyles(styles)(VFBExample);
