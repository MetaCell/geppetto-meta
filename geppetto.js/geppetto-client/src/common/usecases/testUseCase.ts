import { app } from '../index';
import { UseCase } from './base/UseCase';

interface testUseCaseOptions {
  canvasId: string;
}

export const testUseCase:UseCase = {
  type: 'TEST_USE_CASE',

  run: (options: testUseCaseOptions) => {

  }
};

export function canTest(state): boolean {
  return testUseCase.checkConditions( state ).isAllowed;
}

export function test(options: testUseCaseOptions){
  app.runUseCase(testUseCase, options);
}