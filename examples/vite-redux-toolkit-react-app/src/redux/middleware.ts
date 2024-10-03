import { Middleware } from '@reduxjs/toolkit';
import * as GeppettoActions from '@metacell/geppetto-meta-client/common/actions/actions';

export const exampleMiddleware: Middleware = () => (next) => (action) => {
  switch (action.type) {
    case GeppettoActions.clientActions.MODEL_LOADED:
      break;
    case 'DATA_LOADING_START':
      next(GeppettoActions.waitData('Load big model ...', 'DATA_LOADING_END'));
      break;
    default:
      break;
  }
  
  next(action);
};
