export interface ControlsStrategyInterface {
    getTarget(): Object;
    setTarget(x: number,y: number, z: number) : void;
    update(): void;
    reset(): void;
    addEventListener(evt: string, callback : Function): void;
}
