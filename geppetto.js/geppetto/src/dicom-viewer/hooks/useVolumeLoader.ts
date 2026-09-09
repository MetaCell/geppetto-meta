import { useState, useEffect, useRef } from "react";
import { VolumeLoader } from "@metacell/ami";

// Normalises the `data` prop to a URL array — a plain string becomes a single-element array.
export function resolveDataUrls(data: string | string[] | null | undefined): string[] | null {
  if (!data) return null;
  if (typeof data === "string") return [data];
  if (Array.isArray(data)) return data;
  return null;
}

export interface DownloadProgress {
  loaded: number;
  total: number; // 0 to indicate unknown size
}

// Percentage for a DownloadProgress reading, or null while size is unknown (total === 0)
export function pctOf(p: DownloadProgress | null): number | null {
  if (!p || p.total === 0) return null;
  return Math.min(100, Math.round((p.loaded / p.total) * 100));
}

interface UseVolumeLoaderResult {
  stack: any | null;
  loading: boolean;
  error: Error | null;
  downloadProgress: DownloadProgress | null;
}

export interface UseVolumeLoaderOptions {
  retainRawData?: boolean;
}

export function useVolumeLoader(
  data: string | string[] | null,
  options: UseVolumeLoaderOptions = {},
): UseVolumeLoaderResult {
  const { retainRawData = false } = options;
  const [stack, setStack] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const loaderRef = useRef<any>(null);

  useEffect(() => {
    const urls = resolveDataUrls(data);
    if (!urls) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setStack(null);
    setDownloadProgress(null);

    const loader = new VolumeLoader();
    loaderRef.current = loader;

    loader.on("fetch-progress", ({ loaded, total }: { loaded: number; total: number }) => {
      if (!cancelled) setDownloadProgress({ loaded, total });
    });

    loader
      .load(urls)
      .then(() => {
        if (cancelled) return;
        const series = loader.data[0].mergeSeries(loader.data)[0];
        if (!retainRawData) loader.free();
        loaderRef.current = null;
        const s = series.stack[0];
        s.prepare();
        if (retainRawData) s.pack();
        setStack(s);
        setLoading(false);
        setDownloadProgress(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
        setDownloadProgress(null);
      });

    return () => {
      cancelled = true;
      loaderRef.current?.free();
      loaderRef.current = null;
    };
  }, [JSON.stringify(resolveDataUrls(data)), retainRawData]);

  return { stack, loading, error, downloadProgress };
}
