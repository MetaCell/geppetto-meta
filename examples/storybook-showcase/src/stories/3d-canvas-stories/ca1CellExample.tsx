import { fn } from '@storybook/test';

import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';
import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import { mapToCanvasData } from '@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils';
import Manager from '@metacell/geppetto-meta-core/ModelManager';
import ca1_model from './assets/models/ca1_model.json';

const COLORS = [
  { r: 0, g: 0.2, b: 0.6, a: 1 },
  { r: 0.8, g: 0, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 1 },
  { r: 0, g: 0.8, b: 0, a: 0.5 },
];

window.Instances = window.Instances || {};

const loadModel = () => {
  Manager.loadModel(ca1_model);
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const CA1CellExample = {
  name: 'CA 1 Cell Example',
  args: {
    data: mapToCanvasData([
      {
        instancePath: 'network_CA1PyramidalCell.CA1_CG[0]',
        visualGroups: {
          index: 4,
          custom: {
            soma_group: { color: COLORS[0] },
            dendrite_group: { color: COLORS[1] },
            axon_group: { color: COLORS[2] },
          },
        },
      },
    ]),
    cameraOptions: {
      angle: 60,
      near: 10,
      far: 2000000,
      baseZoom: 1,
      initialPosition: { x: -97.349, y: 53.797, z: 387.82 },
      initialRotation: { rx: 0.051, ry: -0.192, rz: -0.569, radius: 361.668 },
      autoRotate: false,
      movieFilter: true,
      reset: false,
      cameraControls: {
        instance: CameraControls,
        props: {},
      },
    },
    backgroundColor: 0x505050,
    linesThreshold: 10000,
    onSelection: fn(),
  },
  render: (args: any[]) => {
    loadModel();
    return <Canvas {...args} />;
  },
};
