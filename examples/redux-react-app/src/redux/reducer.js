import * as Actions from './actions';


export default function exampleReducer(state = {}, action) {
    switch (action.type) {
        case Actions.ADD_DATA_TO_CANVAS:
            if (action.data !== undefined) {
                let _instances = [...state.instances, action.data.instance]
                return {
                    ...state,
                    instances: _instances
                };
            }
            break;
        default:
            return state;
    }
}
