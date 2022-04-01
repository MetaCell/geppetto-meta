import { ControlsStrategyInterface } from '../ControlsStrategyInterface'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';


export class TrackballControlsStrategy implements ControlsStrategyInterface {
  private controls: any;
  constructor (scene: any, camera: any,
    renderer: any, configs: any){
    const defaultTrackballConfigs = { rotateSpeed: 1.0, zoomSpeed: 1.2, panSpeed: 0.3, noZoom: false, noPan: false }
    if(!configs){
      configs = defaultTrackballConfigs
    }else{
      configs = {...defaultTrackballConfigs, ...configs}
    }
    let { rotateSpeed, zoomSpeed, panSpeed, noZoom, noPan } = configs
    this.controls = new TrackballControls(camera, renderer);
    this.controls.rotateSpeed = rotateSpeed ;
    this.controls.zoomSpeed = zoomSpeed ;
    this.controls.panSpeed = panSpeed ;
    this.controls.noZoom = noZoom;
    this.controls.noPan = noPan;
  }
  update (): void {}

  addEventListener(evt: string, callback : Function): void {
    this.controls.addEventListener(evt, callback)
  }

  reset(): void {
    this.controls.reset()
  }

  getTarget(): Object {
    return this.controls.target;
  }

  setTarget(x: number, y: number, z: number): void {
    this.controls.target.set(x,y,z)
  }

}