import { useEffect, useRef } from "react";
import { useDicomViewerContext } from "../DicomViewerContext";
import { useLayerStack } from "../hooks/useLayerStack";
import type { DownloadProgress } from "../hooks/useVolumeLoader";
import type { LayerState } from "../types";
import { createLayerMaterial, type LayerMaterialOpts } from "./createLayerMaterial";

export interface DicomLayerProps extends LayerMaterialOpts {
  // Unique id used to identify this layer in the store (registerLayer/unregisterLayer)
  id: string;
  // DICOM URL(s) for the overlay volume
  data: string | string[];
  // Render order relative to other layers; lower = drawn first (default: 1)
  renderOrder?: number;
  // Reports this layer's own fetch progress — same shape/semantics as useVolumeLoader's
  onProgress?: (progress: DownloadProgress | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function DicomLayer({
  id,
  data,
  renderOrder = 1,
  onProgress,
  onLoadingChange,
  opacity,
  lut,
  windowCenter,
  windowWidth,
  ...restMaterialOpts
}: DicomLayerProps): null {
  const ctx = useDicomViewerContext();
  const { stack: layerStack, loading, downloadProgress } = useLayerStack(data);
  const layerRef = useRef<LayerState | null>(null);
  // Refs (not deps) so a new onProgress/onLoadingChange identity every render doesn't refire these
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;

  useEffect(() => {
    onProgressRef.current?.(downloadProgress);
  }, [downloadProgress]);

  useEffect(() => {
    onLoadingChangeRef.current?.(loading);
  }, [loading]);

  // React to opacity changes after mount — creation-time value only seeds the initial uniform.
  useEffect(() => {
    if (opacity === undefined) return;
    ctx.setLayerOpacity(id, opacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opacity, id]);

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
