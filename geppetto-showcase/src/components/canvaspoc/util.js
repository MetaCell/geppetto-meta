import SimpleInstance from "@geppettoengine/geppetto-core/model/SimpleInstance";

export const json = {
  global: {
    tabEnableClose: true,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26,
  },
  borders: [
    {
      type: 'border',
      location: 'bottom',
      size: 100,
      children: [],
      barSize: 35,
    },
  ],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 55,
        selected: 0,
        children: [
          {
            type: 'tabset',
            weight: 36,
            children: [
              {
                type: 'tab',
                name: 'Canvas 1',
                component: 'canvas',
              },
            ],
          },
          {
            type: 'tabset',
            weight: 64,
            children: [
              {
                type: 'tab',
                name: 'Canvas 2',
                component: 'canvas',
              },
            ],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 45,
        selected: 0,
        children: [
          {
            type: 'tab',
            name: 'Canvas 3',
            component: 'canvas',
          },
        ],
      },
    ],
  },
};

const instanceTemplate = {
  "eClass": "SimpleInstance",
  "id": "MG_C_3260_BROD_AREA",
  "name": "Brodmann Area 1: primary somatosensory cortex - left",
  "position": {
    "eClass": "Point",
    "x": -45.4,
    "y": -24.6,
    "z": 51.9
  },
  "type": { "eClass": "SimpleType" },
  "value": {
    "eClass": "JSON",
    "json": "{\"synonyms\": []}"
  }
}

export function getInstances (){
  GEPPETTO.ModelFactory.cleanModel();
  const instance = new SimpleInstance(instanceTemplate)
  window.Instances = [instance]
  GEPPETTO.Manager.augmentInstancesArray(window.Instances);
  return window.Instances.map(i => ({ instancePath: i.getId() }))
}