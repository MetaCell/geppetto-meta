import { SELECT_INSTANCE } from '../actions/actions'

export const clientInitialStatus = {
  error: false,
  selected: undefined,
};

export default function geppettoClientReducer ( state = {}, action ) {
  return ({
    ...state,
    ...clientReducer(state, action)
  });
}

function clientReducer (state, action) {
  switch (action.type) {
  case SELECT_INSTANCE:
    if (action.data !== undefined) {
      return {
        ...state,
        selected: action.data
      };
    }
    break;
  default:
    console.log("default scenario hit");
  }
}
