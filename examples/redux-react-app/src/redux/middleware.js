import * as GeppettoActions from '@metacell/geppetto-meta-client/common/actions/actions';


export const exampleMiddleware = store => next => action => {

    switch (action.type) {
        case GeppettoActions.clientActions.MODEL_LOADED:
            break;
        case 'LOADING_START':
            next(GeppettoActions.waitData("Activating instance ...", 'LOADING_END'));
            break;
        default:
            next(action);
            break;
    }
};