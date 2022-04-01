import {ControlsStrategyInterface} from "./ControlsStrategyInterface";

export abstract class ControlsStrategyCreator {

    public abstract create(scene: any, camera: any, renderer: any, configs: Object): ControlsStrategyInterface;

}
