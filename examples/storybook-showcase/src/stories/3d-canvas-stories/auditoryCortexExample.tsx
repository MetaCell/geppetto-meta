import { fn } from '@storybook/test';

import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import { mapToCanvasData } from '@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils';
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import acnet_model from './assets/models/acnet_model.json';

const COLORS = [
  { r: 0, g: 0.2, b: 0.6, a: 1 },
  { r: 0.8, g: 0, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 0.5 },
];

declare global {
  interface Window { Instances: any }
}

window.Instances = window.Instances || {};

const loadModel = () => {
  Manager.loadModel(acnet_model);
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const AuditoryCortexExample = {
  name: 'Auditory Cortex Example',
  args: {
    data: mapToCanvasData([
      {
        instancePath: 'acnet2.baskets_12',
        color: COLORS[1],
      },
      { instancePath: 'acnet2' },
      {
        instancePath: 'acnet2.baskets_12[0]',
        color: COLORS[2],
      },
      {
        instancePath: 'acnet2.baskets_12[7]',
        color: COLORS[3],
      },
    ]),
    cameraOptions: {
      angle: 60,
      near: 10,
      far: 2000000,
      baseZoom: 1,
      cameraControls: {
        instance: CameraControls,
        props: { wireframeButtonEnabled: false },
      },
      reset: false,
      autorotate: false,
      wireframe: false,
      initialPosition: { x: 230.357, y: 256.435, z: 934.238 },
      initialRotation: { rx: -0.294, ry: -0.117, rz: -0.02, radius: 531.19 },
    },
    backgroundColor: 0x505050,
    onSelection: fn(),
    dracoDecoderPath: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/',
  },
  render: (args: any[]) => {
    loadModel();
    return <Canvas {...args} />;
  },
};
