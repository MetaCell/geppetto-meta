import {ControlsStrategyEnum} from "./ControlsStrategyEnum";
import {getControlStrategy} from "./ControlsStrategyService";


export default class Controls {
    // TODO: Add threeJS types
    private controlsStrategy: any;
    private camera: any;
    private renderer: any;
    private scene: any;
    private onUpdate: Function;

    constructor(controlsStrategy: ControlsStrategyEnum, scene: any, camera: any,
                renderer: any, onUpdate: Function, configs: Object) {
        this.controlsStrategy = getControlStrategy(controlsStrategy, scene, camera, renderer, configs)
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.onUpdate = onUpdate
    }

    getTarget(): Object {
        return this.controlsStrategy.getTarget()
    }

    setTarget(x: number, y: number, z: number): void {
        this.controlsStrategy.setTarget(x, y, z)
    }

    update() {
        this.controlsStrategy.update()
        this.onUpdate()
    }

    reset() {
        this.controlsStrategy.reset()
    }

    addEventListener(evt: string, callback: Function) {
        this.controlsStrategy.addEventListener(evt, callback)
    }


}