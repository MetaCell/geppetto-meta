import * as GeppettoActions from '@metacell/geppetto-meta-client/common/actions/actions';
import * as Actions from '../redux/actions';

/**
 * Your own custom middleware that you can use to react to geppetto actions.
 */
export const exampleMiddleware = store => next => action => {

    switch (action.type) {
        case GeppettoActions.clientActions.MODEL_LOADED:
            break;
        case Actions.DATA_LOADING_START:
            next(GeppettoActions.waitData('Load big model ...', Actions.DATA_LOADING_END));
            break;
        default:
            break;
    }

    next(action);
};