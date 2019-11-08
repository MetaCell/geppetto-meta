
const GEPPETTO = {};
window.GEPPETTO = GEPPETTO;
require('../js/common/GEPPETTO.Resources').default(GEPPETTO);
require('../js/pages/geppetto/GEPPETTO.Events').default(GEPPETTO);
const Manager = require('../js/common/Manager').default;
const ModelFactory = require('../js/geppettoModel/ModelFactory').default(GEPPETTO);
const testModel = require('./resources/test_model.json');

GEPPETTO.Utility = {};
GEPPETTO.Utility.extractMethodsFromObject = () => [];
GEPPETTO.trigger = evt => console.log(evt, 'triggered');
GEPPETTO.Manager = new Manager();
console.warn = () => null;
GEPPETTO.CommandController = { 
  log: console.log, 
  createTags: (a, b) => null 
};

test('load test model with new instances', () => {
  GEPPETTO.Manager.loadModel(testModel);

  expect(ModelFactory.allPaths.length).toBe(11);
  ModelFactory.allPaths = [];
});

test('load demo model 1', () => {
  GEPPETTO.Manager.loadModel(require('./resources/model.1.json'));
  // console.log(ModelFactory.allPaths);
  expect(ModelFactory.allPaths.length).toBe(136);
  
  
});
  