import { fn } from '@storybook/test';

import ModelFactory from '@metacell/geppetto-meta-core/ModelFactory';
import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';

import CameraControls from '@metacell/geppetto-meta-ui/camera-controls/CameraControls';
import SimpleInstance from '@metacell/geppetto-meta-core/model/SimpleInstance';
import Resources from '@metacell/geppetto-meta-core/Resources';
import { mapToCanvasData } from '@metacell/geppetto-meta-ui/3d-canvas/utils/SelectionUtils';

import neuron from './assets/SketchVolumeViewer_SAAVR_SAAVR_1_1_0000_draco.gltf?raw';
import contact from './assets/Sketch_Volume_Viewer_AIB_Rby_AIAR_AIB_Rby_AIAR_1_1_0000_green_0_24947b6670.gltf?raw';
import { augmentInstancesArray } from '@metacell/geppetto-meta-core/Instances';

const instance1spec = {
  eClass: 'SimpleInstance',
  id: 'ANeuron',
  name: 'The first SimpleInstance to be render with Geppetto Canvas',
  type: { eClass: 'SimpleType' },
  visualValue: {
    eClass: Resources.GLTF,
    gltf: neuron,
  },
};
const instance2spec = {
  eClass: 'SimpleInstance',
  id: 'AContact',
  name: 'The second SimpleInstance to be render with Geppetto Canvas',
  type: { eClass: 'SimpleType' },
  visualValue: {
    eClass: Resources.GLTF,
    gltf: contact,
  },
};

declare global {
  interface Window { Instances: any }
}

window.Instances = window.Instances || {};

const model = () => {
  ModelFactory.cleanModel();
  const instances = [
    new SimpleInstance(instance1spec),
    new SimpleInstance(instance2spec),
  ];
  window.Instances = instances;
  augmentInstancesArray(window.Instances);
  return instances;
};

function getProxyInstances() {
  return model().map(i => (
    { instancePath: i.getId() }));
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const MultipleInstances = {
  name: 'Multiple Canvas Instances Display',
  args: {
    data: mapToCanvasData(getProxyInstances()),
    cameraOptions: {
      angle: 50,
      near: 0.01,
      far: 1000,
      baseZoom: 1,
      cameraControls: {
        instance: CameraControls,
        props: { wireframeButtonEnabled: false },
      },
      reset: false,
      autorotate: false,
      wireframe: false,
    },
    backgroundColor: 0x505050,
    onSelection: fn(),
  },

  // We have a special "render" method here as we want to diplay as much of canvas than instances
  render: (args: any[]) => {
    const numberOfInstances = 5;
    return (
      <>
        {[...Array(numberOfInstances).keys()].map(i => (
          <Canvas
            key={`canvas_${i}`}
            {...args}
          />
        ),
        )}
      </>
    );
  },
};
