import {
  SELECT_INSTANCE,
  LOAD_MODEL,
  MODEL_LOADING,
  MODEL_LOADED,
} from '../actions/actions';

export const callbacksList = {
  [SELECT_INSTANCE]: { 'list': [] },
  [LOAD_MODEL]: { 'list': [] },
  [MODEL_LOADING]: { 'list': [] },
  [MODEL_LOADED]: { 'list': [] },
}

export function callbacksMiddleware({ getState, dispatch }) {
  return function(next) {
    return function(action) {
      switch (action.type) {
      case SELECT_INSTANCE:
        if (callbacksList[action.type].list.length > 0) {
          callbacksList[action.type].list.map(item => {
            item();
          });
        }
        break;
      default:
        console.log('default case in geppetto middleware');
        break;
      }
      return next(action);
    }
  }
}