import { SET_LAYOUT } from '../actions/layoutActions';

export const layoutInitialStatus = { };

function removeUndefined (obj) {
  return Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : '');
}

export default function geppettoLayoutReducer ( state = {}, action ) {
  return ({
    ...state,
    ...layoutReducer(state, action)
  });
}

function layoutReducer (state, action) {
  switch (action.type) {
  case SET_LAYOUT: {
    return { ...state, ...action.data }
  }
  default:
    return state
  }
}
