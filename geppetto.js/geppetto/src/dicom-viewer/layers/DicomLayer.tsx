import { useEffect, useRef } from "react";
import { useDicomViewerContext } from "../DicomViewerContext";
import { useLayerStack } from "../hooks/useLayerStack";
import { createLayerMaterial, LayerMaterialOpts } from "./createLayerMaterial";
import { LayerState } from "../types";

export interface DicomLayerProps extends LayerMaterialOpts {
  // Unique id used to identify this layer in the store (registerLayer/unregisterLayer)
  id: string;
  // DICOM URL(s) or Geppetto instance for the overlay volume
  data: string | string[] | any;
  // Render order relative to other layers; lower = drawn first (default: 1)
  renderOrder?: number;
}

/*
 * Declarative multi-image overlay layer component.
 *
 * Drop a <DicomLayer> inside <DicomViewer> to load an additional volume and
 * blend it on top of the base stack.  The layer is registered in the context
 * store so toolbar buttons / useLayerControls can mutate its opacity / LUT /
 * transform at runtime.
 *
 * GPU resources (ShaderMaterial + DataTextures) are created once and disposed
 * when the component unmounts.
 *
 * For CT background removal (air transparency) pass backgroundRemoval={true}.
 * The LUT-based technique keeps background voxels transparent while tissue
 * remains fully opaque — see createLayerMaterial.ts for the implementation.
 */
export function DicomLayer({
  id,
  data,
  renderOrder = 1,
  opacity,
  lut,
  windowCenter,
  windowWidth,
  ...restMaterialOpts
}: DicomLayerProps): null {
  const ctx = useDicomViewerContext();
  const { stack: layerStack } = useLayerStack(data);
  const layerRef = useRef<LayerState | null>(null);

  // React to opacity changes after mount — creation-time value only seeds the initial uniform.
  useEffect(() => {
    if (opacity === undefined) return;
    ctx.setLayerOpacity(id, opacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opacity, id]);

  /*
   * Window/level and LUT are independent knobs but often change together (e.g. a
   * preset switch resets both), so they share one effect rather than firing two
   * separate store updates (and two invalidates) per user action.
   */
  useEffect(() => {
    if (windowCenter !== undefined && windowWidth !== undefined) {
      ctx.setLayerWindowLevel(id, windowCenter, windowWidth);
    }
    if (lut !== undefined) {
      ctx.setLayerLut(id, lut);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowCenter, windowWidth, lut, id]);

  useEffect(() => {
    /*
     * Wait for both the base stack (for geometry/orientation) and the overlay
     * stack (for texture data) to be ready.
     */
    if (!layerStack || !ctx.stack) return undefined;

    const partial = createLayerMaterial(layerStack, {
      opacity,
      lut,
      windowCenter,
      windowWidth,
      ...restMaterialOpts,
    });
    const layer: LayerState = { id, renderOrder, ...partial };
    layerRef.current = layer;
    ctx.registerLayer(layer);

    return () => {
      ctx.unregisterLayer(id);
      // Dispose GPU-side resources; the store reference is already removed above.
      try {
        layer.material.dispose();
        Object.values(layer.uniforms).forEach((u: any) => {
          if (u?.value?.isTexture) u.value.dispose();
          if (Array.isArray(u?.value)) {
            u.value.forEach((v: any) => v?.isTexture && v.dispose());
          }
        });
      } catch (_) {
        // Swallow — component may unmount after the WebGL context is lost
      }
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerStack, ctx.stack, id, renderOrder]);

  return null;
}
