import {
  LOAD_MODEL,
  MODEL_LOADING,
  MODEL_LOADED,
} from '../actions/actions';

export const modelInitialStatus = {
  error: false,
  instances: [],
};

export default ( state = {}, action ) => ({
  ...state,
  ...modelReducer(state, action)
});

function modelReducer (state, action) {
  switch (action.type) {
  case LOAD_MODEL:
    console.log("load the geppetto model");
    break;
  case MODEL_LOADING:
    console.log("loading the geppetto model");
    break;
  case MODEL_LOADED:
    console.log("geppetto model loaded");
    break;
  default:
    console.log("default case geppetto model reducer");
  }
}