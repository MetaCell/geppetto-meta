const GEPPETTO = {};
window.GEPPETTO = GEPPETTO;

import Manager from '../src/ModelManager';
import ModelFactory from '../src/ModelFactory';
import testModel from './resources/test_model.json'

GEPPETTO.trigger = evt => console.log(evt, 'triggered');

console.warn = () => null;

test('fetch instances', () => {
  Manager.loadModel(testModel);
  const instanceLength = Instances.length;
  const allPathsLength = ModelFactory.allPaths.length;

  testModel.worlds[0].instances.push({
    "eClass": "SimpleInstance",
    "position": {
      "eClass": "Point",
      "y": 1,
      "x": 1,
      "z": 1
    },
    "value": {
      "eClass": "JSON",
      "json": "{\"l\": [\"x\", \"y\"]}"
    },
    "type": {
      "eClass": "SimpleType",
      "$ref": "//@libraries.0/@types.1"
    },
    "id": "n",
    "name": "N"
  });
  ModelFactory.mergeModel(testModel);

  expect(ModelFactory.allPaths.length).toBe(allPathsLength + 1);
  expect(Instances.length).toBe(instanceLength + 1);
  Instances.getInstance('n'); // Static instances are always instantiated
  expect(Model.n.getValue().l[0]).toBe('x');
});
