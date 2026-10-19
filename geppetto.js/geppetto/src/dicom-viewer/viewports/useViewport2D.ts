import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  StackHelper,
  LocalizerHelper,
  LutHelper,
  OrthographicCamera,
  TrackballOrthoControl,
  DataVertexShader,
  DataFragmentShader,
} from "@metacell/ami";
import { LayerState, PlaneOrientation, ShaderUniform } from "../types";

interface Viewport2DHandle {
  scene: THREE.Scene;
  localizerScene: THREE.Scene;
  camera: any; // AMI OrthographicCamera
  controls: any; // AMI TrackballOrthoControl
  stackHelper: any; // AMI StackHelper
  localizerHelper: any; // AMI LocalizerHelper
  refreshOverlayMeshes: (
    layers: LayerState[],
    baseStack: any,
    forceOpaque?: boolean,
    soloLutName?: string,
  ) => void;
  fitCamera: (size: { width: number; height: number }) => void;
  dispose: () => void;
}

// Opacity curve that ignores intensity entirely — every voxel fully opaque, for soloMode overlays.
const OPAQUE_LUTS_O = {
  opaque: [
    [0, 1],
    [1, 1],
  ] as [number, number][],
};

export function useViewport2D(
  stack: any | null,
  planeOrientation: PlaneOrientation,
  sliceColor: number,
  domElementRef: React.RefObject<HTMLElement>,
  soloMode = false,
): Viewport2DHandle | null {
  // useState (not useRef) so that components re-render when the handle is created/destroyed.
  const [handle, setHandle] = useState<Viewport2DHandle | null>(null);

  const overlayMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  /*
   * Cache of solo (forced-opaque) materials per layer id, plus the live material they were built
   * from — see the dev docs.
   */
  const soloMaterialsRef = useRef<
    Map<
      string,
      {
        material: THREE.ShaderMaterial;
        source: THREE.ShaderMaterial;
        lutHelper: any;
        lutName?: string;
      }
    >
  >(new Map());

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
    camera.orientation = planeOrientation;

    /*
     * ami's factory-built camera loses the `isOrthographicCamera: true` literal through
     * declaration bundling; the instance genuinely extends THREE.OrthographicCamera.
     */
    const controls = new TrackballOrthoControl(camera as THREE.OrthographicCamera, domEl);
    controls.staticMoving = true;
    controls.noRotate = true;
    camera.controls = controls;

    /*
     * Now safe to set canvas (triggers _updateCanvas internally). CSS pixels here is only a
     * bootstrap value — the resize observer refits with drawing-buffer pixels immediately after.
     */
    camera.canvas = { width: domEl.clientWidth, height: domEl.clientHeight };
    camera.update();
    if (domEl.clientWidth > 0 && domEl.clientHeight > 0) {
      camera.fitBox(2, 1);
    }

    (camera as any).manual = true;

    // --- StackHelper ---
    const stackHelper = new StackHelper(stack);
    stackHelper.bbox.visible = false;
    stackHelper.borderColor = sliceColor;
    stackHelper.slice.canvasWidth = -1;
    stackHelper.slice.canvasHeight = -1;
    stackHelper.orientation = camera.stackOrientation;
    stackHelper.index = Math.floor(stackHelper.orientationMaxIndex / 2);
    // A soloMode pane shows only its overlay layer(s) — the base volume's own slice never draws.
    if (soloMode) stackHelper.slice.visible = false;
    scene.add(stackHelper);

    // --- LocalizerHelper ---
    const referencePlane = stackHelper.slice.cartesianEquation();
    const localizerHelper = new LocalizerHelper(stack, stackHelper.slice.geometry, referencePlane);
    localizerHelper.canvasWidth = domEl.clientWidth;
    localizerHelper.canvasHeight = domEl.clientHeight;
    localizerScene.add(localizerHelper);

    /*
     * A solo material's uTextureLUT is an independent texture — must be disposed explicitly or it
     * leaks GPU memory on every cache rebuild/eviction/unmount.
     */
    const disposeSoloMaterial = (cached?: { material: THREE.ShaderMaterial }) => {
      if (!cached) return;
      (cached.material.uniforms.uTextureLUT?.value as THREE.Texture | undefined)?.dispose?.();
      cached.material.dispose();
    };

    // --- Overlay mesh management ---
    const refreshOverlayMeshes = (
      layers: LayerState[],
      baseStack: any,
      forceOpaque = false,
      soloLutName = "default",
    ) => {
      const currentIds = new Set(layers.map(l => l.id));
      // Remove meshes for layers that no longer exist
      overlayMeshesRef.current.forEach((mesh, id) => {
        if (!currentIds.has(id)) {
          scene.remove(mesh);
          overlayMeshesRef.current.delete(id);
          disposeSoloMaterial(soloMaterialsRef.current.get(id));
          soloMaterialsRef.current.delete(id);
        }
      });
      // Create / recreate meshes for each layer (geometry may have changed on slice nav)
      layers.forEach(layer => {
        const old = overlayMeshesRef.current.get(layer.id);

        let material = layer.material;
        if (forceOpaque) {
          const cached = soloMaterialsRef.current.get(layer.id);
          if (cached && cached.source === layer.material) {
            // Live material unchanged — reuse the cached solo material, only its LUT can change.
            if (cached.lutName !== soloLutName) {
              cached.lutHelper.lut = soloLutName;
              cached.material.uniforms.uTextureLUT.value = cached.lutHelper.texture;
              cached.lutName = soloLutName;
            }
            material = cached.material;
          } else {
            disposeSoloMaterial(cached);
            /*
             * Dedicated LUT, always fully opaque — never the live layer's own colormap or
             * background-removal curve.
             */
            const lutHelper = new LutHelper(document.createElement("div"));
            lutHelper.luts = LutHelper.presetLuts();
            lutHelper.lut = soloLutName;
            // Merge with the built-in presets — replacing wholesale loses other LUT state.
            lutHelper.lutsO = { ...LutHelper.presetLutsO(), ...OPAQUE_LUTS_O };
            lutHelper.lutO = "opaque";

            /*
             * Alias every other uniform to the live layer's own (so future mutation is picked up
             * with no rebuild) except uOpacity, forced to 1 independently.
             */
            const soloUniforms: Record<string, ShaderUniform> = {};
            Object.keys(layer.uniforms).forEach(key => {
              /*
               * Spread the original wrapper, not just {value} — it also carries typeGLSL, which
               * the shader's declaration generator needs.
               */
              if (key === "uOpacity") soloUniforms[key] = { ...layer.uniforms[key], value: 1 };
              else if (key === "uTextureLUT") {
                soloUniforms[key] = { ...layer.uniforms[key], value: lutHelper.texture };
              } else soloUniforms[key] = layer.uniforms[key];
            });
            const soloMaterial = new THREE.ShaderMaterial({
              side: THREE.DoubleSide,
              uniforms: soloUniforms,
              vertexShader: new DataVertexShader().compute(),
              fragmentShader: new DataFragmentShader(soloUniforms).compute(),
              transparent: true,
              /*
               * Writes depth so later draws on this plane get the near-plane clipping the hidden
               * base slice would otherwise give.
               */
              depthWrite: true,
            });
            soloMaterialsRef.current.set(layer.id, {
              material: soloMaterial,
              source: layer.material,
              lutHelper,
              lutName: soloLutName,
            });
            material = soloMaterial;
          }
        }

        // Pure opacity/window-level/LUT edits leave geometry and material untouched — skip rebuild.
        if (old && old.geometry === stackHelper.slice.geometry && old.material === material) {
          return;
        }
        if (old) scene.remove(old);
        const mesh = new THREE.Mesh(stackHelper.slice.geometry, material);
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
      soloMaterialsRef.current.forEach(disposeSoloMaterial);
      soloMaterialsRef.current.clear();
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
  }, [stack, planeOrientation, sliceColor, domElementRef.current, soloMode]);

  return handle;
}
