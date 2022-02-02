import { UseCase } from './base/UseCase';

interface clearCanvasOptions {
  canvasId: string;
}

export const clearCanvasUseCase:UseCase = {
  type: 'CLEAR_CANVAS',

  run: (options: clearCanvasOptions) => {

  }
};

export function canClearCanvas(state): boolean {
  return clearCanvasUseCase.checkConditions( state ).isAllowed;
}

export function clearCanvas(options: clearCanvasOptions){
  app.runUseCase(clearCanvasUseCase, options);
}