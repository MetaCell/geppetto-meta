import { ControlsStrategyCreator } from "../ControlsStrategyCreator";
import { ControlsStrategyInterface } from "../ControlsStrategyInterface";
import { TrackballControlsStrategy } from "./TrackballControlsStrategy";

export class TrackballControlsCreator extends ControlsStrategyCreator {

  create (scene: any, camera: any, renderer: any, configs: Object): ControlsStrategyInterface {
    return new TrackballControlsStrategy(scene, camera, renderer, configs);
  }
}