import { fn } from '@storybook/test';

import * as THREE from 'three';
import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import { mapToCanvasData } from '@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils';
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import vfb_model from './assets/models/vfb_model.json';
import { useState } from 'react';

const COLORS = [
  { r: 0.36, g: 0.36, b: 0.36, a: 1 },
  { r: 0, g: 1, b: 0, a: 1 },
  { r: 1, g: 0, b: 1, a: 1 },
  { r: 0, g: 0, b: 1, a: 1 },
  { r: 1, g: 0.83, b: 0, a: 1 },
  { r: 0, g: 0.52, b: 0.96, a: 1 },
  { r: 1, g: 0, b: 0, a: 1 },
];

window.Instances = window.Instances || {};

const loadModel = () => {
  Manager.loadModel(vfb_model);
};

/**
   * Add a 3D plane to the scene at the given coordinates (4) points.
   * It could be any geometry really.
   * @returns {THREE.Mesh}
   */
const get3DPlane = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, x3: number, y3: number, z3: number, x4: number, y4: number, z4: number): any => {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(x1, y1, z1), // vertex0
    new THREE.Vector3(x2, y2, z2), // 1
    new THREE.Vector3(x3, y3, z3), // 2
    new THREE.Vector3(x4, y4, z4), // 3
  );
  geometry.faces.push(
    new THREE.Face3(2, 1, 0), // use vertices of rank 2,1,0
    new THREE.Face3(3, 1, 2), // vertices[3],1,2...
  );
  geometry.computeBoundingBox();
  if (!geometry.boundingBox) {
    return [];
  }

  const max = geometry.boundingBox.max;
  const min = geometry.boundingBox.min;
  const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
  const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
  const faces = geometry.faces;

  geometry.faceVertexUvs[0] = [];

  for (const face of faces) {
    const v1 = geometry.vertices[face.a],
      v2 = geometry.vertices[face.b],
      v3 = geometry.vertices[face.c];

    geometry.faceVertexUvs[0].push([
      new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
      new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
      new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y),
    ]);
  }
  geometry.uvsNeedUpdate = true;
  geometry.dynamic = true;

  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  // material.nowireframe = true; ?
  material.wireframe = false;

  material.opacity = 0.3;
  material.transparent = true;
  material.color.setHex(0xb0b0b0);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;
  mesh.clickThrough = true;
  return mesh;
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const VFBExample = {
  name: 'VFB Example',
  args: {
    data: mapToCanvasData([
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
    ]),
    cameraOptions: {
      initialPosition: { x: 319.7, y: 153.12, z: -494.2 },
      initialRotation: { rx: -3.14, ry: 0, rz: -3.14, radius: 559.83 },
      initialFlip: ['y', 'z'],
      cameraControls: {
        instance: CameraControls,
        props: { wireframeButtonEnabled: true },
      },
      rotationSpeed: 3,
    },
    backgroundColor: 0x505050,
    linesThreshold: 10000,
    onSelection: fn(),
  },
  render: (args: any[]) => {
    loadModel();
    const [threeDObjects, set3dObjects] = useState([]);

    const onMount = (scene: any) => {
      const bb = new THREE.Box3().setFromObject(scene);
      const plane = get3DPlane(bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z);
      set3dObjects([plane]);
      const axesHelper = new THREE.AxesHelper(100);
      scene.add(axesHelper);
    };

    return <Canvas {...args} onMount={onMount} threeDObjects={threeDObjects} />;
  },
};
