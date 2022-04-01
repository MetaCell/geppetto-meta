import { ControlsStrategyEnum } from './ControlsStrategyEnum'
import { TrackballControlsCreator } from "./trackballControls/TrackballControlsCreator";
import { ControlsStrategyCreator } from "./ControlsStrategyCreator";


const controlsStrategies = new Map<ControlsStrategyEnum, ControlsStrategyCreator>([
  [ControlsStrategyEnum.TRACKBALL_CONTROLS, new TrackballControlsCreator()],
]);

export function getControlStrategy (controlsStrategy: ControlsStrategyEnum, scene: any, camera: any,
  renderer: any, configs: Object): any {
  return controlsStrategies.get(controlsStrategy).create(scene, camera, renderer, configs);
}