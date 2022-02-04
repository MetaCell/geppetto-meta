import * as redux from "redux";
import { callbacksMiddleware } from './middleware/geppettoMiddleware';
import { initLayoutManager } from './layout/LayoutManager';
import EventManager from './EventManager';
import { layoutInitialState, LayoutState, layout, widgets } from './reducer/geppettoLayout';
import geppettoClientReducer, { clientInitialState, ClientState } from './reducer/geppettoClient';
import { geppettoLoaderReducer, loaderInitialState, LoaderState } from './reducer/geppettoLoader'
import { WidgetMap, ComponentMap } from "./layout/model";
import TabsetIconFactory from "./layout/TabsetIconFactory";
import { reducerDecorator } from "./reducer/reducerDecorator"
import { GeppettoAction } from "./actions";
import { UseCase } from './usecases/base/UseCase';
import { UseCaseResult, UseCaseResultType } from './usecases/base/UseCaseResult';
import { RejectionReason, RejectKey } from './usecases/base/RejectionReason';

declare var window: any;

interface GeppettoState{
  client: ClientState,
  layout: LayoutState,
  widgets: WidgetMap,
  loader: LoaderState
}

const initialState: GeppettoState = {
  client: clientInitialState,
  layout: layoutInitialState,
  loader: loaderInitialState,
  widgets: {}
};

const staticReducers = {
  client: geppettoClientReducer,
  loader: geppettoLoaderReducer,
  layout,
  widgets
}

// Use the below for redux debugging with stack trace
//const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({trace: true, traceLimit: 25}) || redux.compose;
const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;

export function Application(){

  let _store:redux.Store<any, GeppettoAction> ;

  const dispatch = function(data:any){
    console.log('dispatching...', data);
    this._store.dispatch(data);
  };

  const dispatchSuccess = function(data:any){
    data.resultType = UseCaseResultType.SUCCESS;
    dispatch(UseCaseResult(data));
  };

  const dispatchFailure = function(data:any){
    data.resultType = UseCaseResultType.FAILURE;
    dispatch(UseCaseResult(data));
  };

  const dispatchCancelled = function(data:any){
    data.resultType = UseCaseResultType.CANCELLED;
    dispatch(UseCaseResult(data));
  };

  const dispatchStart = function(data:any) {
    data.resultType = UseCaseResultType.START;
    let result = UseCaseResult( data );
    dispatch(result);
  };

  const dispatchUseCaseSuccess = function(useCase, data){
    dispatchSuccess({
      useCase: useCase
      , type: useCase.type
      , data: data
    });
  };

  const dispatchUseCaseFailure = function(useCase, reason){
    dispatchFailure({
      useCase: useCase
      , type: useCase.type
      , rejectionReason: reason
    });
  };

  const dispatchUseCaseCancelled = function(useCase, reason){
    dispatchCancelled({
      useCase: useCase
      , type: useCase.type
      , rejectionReason: reason
    });
  };

  const dispatchUseCaseStart = function(useCase, useCaseData?){
    dispatchStart({
      useCase: useCase
      , type: useCase.type
      , data: useCaseData
    });
  };

  return Object.freeze({

    initStore( 
      reducers: redux.ReducersMapObject, 
      state: any, 
      enhancers: redux.Middleware[], 
      layout: {iconFactory?: TabsetIconFactory, baseLayout?: LayoutState, componentMap: ComponentMap}={componentMap: {}}) 
    {
  
      const layoutManager = initLayoutManager(layout.baseLayout || layoutInitialState, layout.componentMap, layout.iconFactory)
      const allMiddlewares = [...enhancers, callbacksMiddleware, layoutManager.middleware];
  
      this._store = redux.createStore(
        reducerDecorator(redux.combineReducers({...staticReducers, ...reducers})),
        {...initialState, ...state },
        storeEnhancers(redux.applyMiddleware(...allMiddlewares))
      );
      EventManager.setStore(this._store);
    },

    dispatch(key: string, data: any){
      dispatchSuccess({ type: key, data: data });
    },

    getReduxStore(){
      return this._store;
    },

    runUseCase(useCase: UseCase, options:any = {}){
      Object.assign({ dispatchStart: true }, options);

      if(useCase.checkConditions){
        let ruleResult = useCase.checkConditions(this.getReduxStore().getState(), options);
        if(!ruleResult.isAllowed){
          console.log(ruleResult.failMessage); //TODO: dispatch Notification
          return;
        }
      }

      if (useCase.checkValidators){
        let ruleResult = useCase.checkValidators(options);
        if(!ruleResult.isAllowed){
          console.log(ruleResult.failMessage); //TODO: dispatch Notification
          return;
        }
      }

      if(options.dispatchStart !== false)
        dispatchUseCaseStart(useCase, options.dispatchStartData);

      return useCase.run(options)
      .then(function (useCaseResult:any = {}) {
        dispatchUseCaseSuccess(useCase, useCaseResult);
      }, function(reason){

        if(RejectionReason.was(reason, RejectKey.CANCELLED)){
          dispatchUseCaseCancelled(useCase, reason);
        }
        else{
          dispatchUseCaseFailure(useCase, reason);

          //Propagate failure, we aren't handling/recovering, just dispatching action failure.
          //Leave it up to individual use cases how they handle rejections.
          return Promise.reject(reason);
        }
      });
    }
  });
}
