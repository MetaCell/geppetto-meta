import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { StackHelper, LocalizerHelper, OrthographicCamera, TrackballOrthoControl } from "ami.js";
import { LayerState, PlaneOrientation } from "../types";

interface Viewport2DHandle {
  scene: THREE.Scene;
  localizerScene: THREE.Scene;
  camera: any; // AMI OrthographicCamera
  controls: any; // AMI TrackballOrthoControl
  stackHelper: any; // AMI StackHelper
  localizerHelper: any; // AMI LocalizerHelper
  refreshOverlayMeshes: (layers: LayerState[], baseStack: any) => void;
  fitCamera: (size: { width: number; height: number }) => void;
  dispose: () => void;
}

// Slice orientation string → AMI StackHelper orientation integer
const ORIENTATION_MAP: Record<PlaneOrientation, string> = {
  axial: "axial",
  sagittal: "sagittal",
  coronal: "coronal",
};

export function useViewport2D(
  stack: any | null,
  planeOrientation: PlaneOrientation,
  sliceColor: number,
  domElementRef: React.RefObject<HTMLElement>,
): Viewport2DHandle | null {
  // useState (not useRef) so that components re-render when the handle is created/destroyed.
  const [handle, setHandle] = useState<Viewport2DHandle | null>(null);

  /*
   * Track overlay meshes per layer id so we can swap them when geometry rebuilds.
   * useRef is correct here — mesh map changes must not trigger re-renders.
   */
  const overlayMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!stack || !domElementRef.current) return undefined;

    const domEl = domElementRef.current;

    // --- Scene ---
    const scene = new THREE.Scene();
    const localizerScene = new THREE.Scene();

    // --- AMI Camera ---
    const camera = new OrthographicCamera(
      domEl.clientWidth / -2,
      domEl.clientWidth / 2,
      domEl.clientHeight / 2,
      domEl.clientHeight / -2,
      1,
      1000,
    );

    const worldbb = stack.worldBoundingBox();
    const lpsDims = new THREE.Vector3(
      (worldbb[1] - worldbb[0]) / 2,
      (worldbb[3] - worldbb[2]) / 2,
      (worldbb[5] - worldbb[4]) / 2,
    );
    camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    camera.box = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 5, lpsDims.y + 5, lpsDims.z + 5),
    };
    camera.orientation = ORIENTATION_MAP[planeOrientation];

    /*
     * Controls MUST be assigned before camera.canvas — the canvas setter calls
     * _updateCanvas → _updateMatrices → this._controls.update() and
     * this.controls.handleResize(), both of which crash if _controls is null.
     */
    const controls = new TrackballOrthoControl(camera, domEl);
    controls.staticMoving = true;
    controls.noRotate = true;
    camera.controls = controls;

    // Now safe to set canvas (triggers _updateCanvas internally).
    camera.canvas = { width: domEl.clientWidth, height: domEl.clientHeight };
    camera.update();
    /*
     * A pane can start out hidden (0x0) — e.g. single_view mode's inactive panes —
     * in which case fitBox's internal _computeZoom bails out (dimension <= 0) and
     * logs AMI's "Invalid dimension provided." warning for no benefit. Viewport2DContent's
     * resize effect already re-fits (via fitCamera below) once this pane gets a real size.
     */
    if (domEl.clientWidth > 0 && domEl.clientHeight > 0) {
      camera.fitBox(2, 1);
    }

    /*
     * Prevent React Three Fiber's View.prepareSkissor from overwriting AMI's
     * left/right/top/bottom directly — set manual=true so it only calls
     * updateProjectionMatrix(), which delegates to AMI's own implementation.
     */
    (camera as any).manual = true;

    // --- StackHelper ---
    const stackHelper = new StackHelper(stack);
    stackHelper.bbox.visible = false;
    stackHelper.borderColor = sliceColor;
    stackHelper.slice.canvasWidth = -1;
    stackHelper.slice.canvasHeight = -1;
    stackHelper.orientation = camera.stackOrientation;
    stackHelper.index = Math.floor(stackHelper.orientationMaxIndex / 2);
    scene.add(stackHelper);

    // --- LocalizerHelper ---
    const referencePlane = stackHelper.slice.cartesianEquation();
    const localizerHelper = new LocalizerHelper(stack, stackHelper.slice.geometry, referencePlane);
    localizerHelper.canvasWidth = domEl.clientWidth;
    localizerHelper.canvasHeight = domEl.clientHeight;
    localizerScene.add(localizerHelper);

    // --- Overlay mesh management ---
    const refreshOverlayMeshes = (layers: LayerState[], baseStack: any) => {
      const currentIds = new Set(layers.map(l => l.id));
      // Remove meshes for layers that no longer exist
      overlayMeshesRef.current.forEach((mesh, id) => {
        if (!currentIds.has(id)) {
          scene.remove(mesh);
          overlayMeshesRef.current.delete(id);
        }
      });
      // Create / recreate meshes for each layer (geometry may have changed on slice nav)
      layers.forEach(layer => {
        const old = overlayMeshesRef.current.get(layer.id);
        /*
         * Pure opacity/window-level/LUT edits leave both the geometry (unchanged slice)
         * and material (same object, mutated uniforms in place) untouched — skip tearing
         * down and recreating the mesh in that case. Without this, every store-level layer
         * edit (dragging a slider fires one update per pointer-move) rebuilt the mesh
         * purely to pick up a value that was already live via the shared material/uniforms
         * reference.
         */
        if (old && old.geometry === stackHelper.slice.geometry && old.material === layer.material) {
          return;
        }
        if (old) scene.remove(old);
        const mesh = new THREE.Mesh(stackHelper.slice.geometry, layer.material);
        mesh.applyMatrix4(baseStack._ijk2LPS);
        mesh.renderOrder = layer.renderOrder;
        scene.add(mesh);
        overlayMeshesRef.current.set(layer.id, mesh);
      });
    };

    // Recalculate camera frustum on container resize
    const fitCamera = (size: { width: number; height: number }) => {
      camera.canvas = { width: size.width, height: size.height };
      camera.fitBox(2, 1);
      localizerHelper.canvasWidth = size.width;
      localizerHelper.canvasHeight = size.height;
    };

    const dispose = () => {
      controls.dispose?.();
      stackHelper.dispose();
      overlayMeshesRef.current.forEach(mesh => {
        scene.remove(mesh);
      });
      overlayMeshesRef.current.clear();
      if (localizerHelper._mesh) {
        localizerHelper.remove(localizerHelper._mesh);
        localizerHelper._mesh.geometry?.dispose();
        localizerHelper._mesh = null;
      }
    };

    setHandle({
      scene,
      localizerScene,
      camera,
      controls,
      stackHelper,
      localizerHelper,
      refreshOverlayMeshes,
      fitCamera,
      dispose,
    });

    return () => {
      dispose();
      setHandle(null);
    };
  }, [stack, planeOrientation, sliceColor, domElementRef.current]);

  return handle;
}
