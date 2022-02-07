import { projectLoadFromIdUseCase } from "../usecases/projectLoadFromIdUseCase"

export interface LoaderState {

}

export const loaderInitialState = {

}

export const geppettoLoaderReducer = (state = loaderInitialState, action) => {

  switch (action.type) {
    case projectLoadFromIdUseCase.type:
    {
      return state; 
    }
  }
}