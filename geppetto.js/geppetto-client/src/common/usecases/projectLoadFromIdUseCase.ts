import { app } from '../index';
import { UseCase } from './base/UseCase';
import MessageSocket from '../../communication/MessageSocket';

interface projectLoadFromIdUseCaseOptions {
  actionData: string 
}

export const projectLoadFromIdUseCase:UseCase = {
  type: 'PROJECT_LOAD_FROM_ID',

  run: (options: projectLoadFromIdUseCaseOptions) => {
    MessageSocket.loadProjectFromIdAsync(options.actionData, (serverMessageData)=>{
      Promise.resolve({ response: serverMessageData });
    });
  }
};

export function canProjectLoadFromId(state): boolean {
  return projectLoadFromIdUseCase.checkConditions( state ).isAllowed;
}

export function projectLoadFromId(options: projectLoadFromIdUseCaseOptions){
  app.runUseCase(projectLoadFromIdUseCase, options);
}