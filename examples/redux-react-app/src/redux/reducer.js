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
        case Actions.CHANGE_INSTANCE_COLOR:
            if (action.data !== undefined) {
                let _instances = [...state.instances];
                for (let instance of _instances) {
                    if (instance.instancePath === action.data.instance) {
                        instance.color = action.data.color
                    }
                }
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
