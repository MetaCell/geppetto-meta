const GEPPETTO = {};
window.GEPPETTO = GEPPETTO;
GEPPETTO.Resources = require('@metacell/geppetto-meta-core/Resources').default;
require('@metacell/geppetto-meta-client/pages/geppetto/GEPPETTO.Events').default(GEPPETTO);
require('@metacell/geppetto-meta-client/communication/MessageHandler').default(GEPPETTO);
const Manager = require('@metacell/geppetto-meta-client/common/Manager').default;
const ModelFactory = require('@metacell/geppetto-meta-core/ModelFactory').default(GEPPETTO);
const testModel = require('./resources/test_model.json');
const EventManager = require('@metacell/geppetto-meta-client/common/EventManager').default;

EventManager.setStore({ dispatch: m => null })

GEPPETTO.Utility = {};
GEPPETTO.Utility.extractMethodsFromObject = () => [];
GEPPETTO.trigger = evt => console.log(evt, 'triggered');
GEPPETTO.Manager = new Manager();
console.warn = () => null;
GEPPETTO.CommandController = {
  log: console.log,
  createTags: (a, b) => null
};

test('fetch instances', () => {
  GEPPETTO.Manager.loadModel(testModel);
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

  const message = { type: 'fetched', data: JSON.stringify({ fetched: JSON.stringify(testModel) }) };

  GEPPETTO.MessageHandler.onMessage(message);

  expect(ModelFactory.allPaths.length).toBe(allPathsLength + 1);
  expect(Instances.length).toBe(instanceLength + 1);
  Instances.getInstance('n'); // Static instances are always instantiated
  expect(Model.n.getValue().l[0]).toBe('x');
});
