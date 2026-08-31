import type { DownloadProgress } from "./useVolumeLoader";
import { useVolumeLoader } from "./useVolumeLoader";

interface UseLayerStackResult {
  stack: any | null;
  loading: boolean;
  error: Error | null;
  downloadProgress: DownloadProgress | null;
}

export function useLayerStack(data: string | string[] | null): UseLayerStackResult {
  return useVolumeLoader(data, { retainRawData: true });
}
