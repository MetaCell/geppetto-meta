import type { DownloadProgress } from "./useVolumeLoader";
import { useVolumeLoader } from "./useVolumeLoader";

interface UseLayerStackResult {
  stack: any | null;
  loading: boolean;
  error: Error | null;
  downloadProgress: DownloadProgress | null;
}

/*
 * Overlay layers (see DicomLayer) need the raw loader buffers to survive prepare() so
 * createLayerMaterial can still read them when building the layer's texture — unlike the
 * base volume loaded via useVolumeLoader itself, which frees its loader as soon as it's
 * packed.
 */
export function useLayerStack(data: string | string[] | null): UseLayerStackResult {
  return useVolumeLoader(data, { retainRawData: true });
}
