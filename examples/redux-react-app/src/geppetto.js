/**
 * Init script from geppetto-showcase. 
 */
export const initGeppetto = () => {
    window.GEPPETTO = {};
    const GEPPETTO = window.GEPPETTO;
    GEPPETTO.Resources = require('@metacell/geppetto-meta-core/Resources').default;
    require('@metacell/geppetto-meta-client/pages/geppetto/GEPPETTO.Events').default(
      GEPPETTO
    );
    const Manager = require('@metacell/geppetto-meta-client/common/Manager')
      .default;
    const ModelFactory = require('@metacell/geppetto-meta-core/ModelFactory').default(
      GEPPETTO
    );
  
    GEPPETTO.Utility = {};
    GEPPETTO.Utility.extractMethodsFromObject = () => [];
    GEPPETTO.trigger = evt => console.log(evt, 'triggered');
    GEPPETTO.Manager = new Manager();
    console.warn = () => null;
    GEPPETTO.CommandController = {
      log: console.log,
      createTags: (a, b) => null,
    };
    GEPPETTO.ComponentFactory = { addExistingComponent: console.log, };
    GEPPETTO.on = console.log;
    GEPPETTO.off = console.log;
    GEPPETTO.UnitsController = {
      getUnitLabel: function (unit) {
        return unit;
      },
      hasUnit: function (unit) {
        return true;
      },
    };
  }