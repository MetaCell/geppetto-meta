import { SELECT_INSTANCE } from '../actions/actions'

export const clientInitialStatus = {
  error: false,
  selected: undefined,
};

export default ( state = {}, action ) => ({
  ...state,
  ...clientReducer(state, action)
});

function clientReducer (state, action) {
  switch (action.type) {
  case SELECT_INSTANCE:
    console.log("SELECT instance case hit");
    break;
  default:
    console.log("default scenario hit");
  }
}
