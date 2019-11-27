/**
 * Geppetto redux store manager
 *
 * Dario Del Piano
 */
define(function (require) {

  const newStore = require('./store/store').default;
  const { callbacksList } = require('./middleware/geppettoMiddleware');
  const { selectInstance } = require('./actions/actions');
  const { SELECT_INSTANCE } = require('./actions/actions');

  // invece di importare la funzione per lo store importare l oggetto stesso incapsulando
  const GeppettoStore = newStore();

  return function (GEPPETTO) {
    GEPPETTO.StoreManager = {
      store: GeppettoStore,
      eventsCallback: callbacksList,

      actionsHandler: {
        [SELECT_INSTANCE]: (scope, geometryIdentifier, point ) => (
          GeppettoStore.dispatch(selectInstance(scope, geometryIdentifier, point))
        )
      },

      injectReducer: function (key, reducer) {
        GeppettoStore.reducerManager.add(key, reducer);
        return this.store;
      }
    };
  };
});
