/**
 * Geppetto redux store manager
 *
 * Dario Del Piano
 */
define(function (require) {

  const newStore = require('./store').default;
  const { callbacksList } = require('./middleware/geppettoMiddleware');
  const GeppettoStore = newStore();

  return function (GEPPETTO) {
    GEPPETTO.StoreManager = {
      store: GeppettoStore,
      eventsCallback: callbacksList,

      injectReducer: function (key, reducer) {
        this.store.reducerManager.add(key, reducer);
        return this.store;
      }
    };
  };
});
