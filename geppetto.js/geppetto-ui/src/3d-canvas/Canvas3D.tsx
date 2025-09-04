import {
  Canvas,
  CanvasProps,
  MeshProps,
  MeshStandardMaterialProps,
  ThreeEvent,
} from "@react-three/fiber";
import React, { useEffect, useRef } from "react";

import { CameraControls } from "@react-three/drei";
import { useState } from "react";
import { BufferGeometry, Loader, Mesh } from "three";

type Canvas3DBaseProps = {
  children?;
  defaultLightOff?: boolean;
  nonInteractive?: boolean;
};

type Canvas3DProps = Canvas3DBaseProps &
  Omit<CanvasProps, keyof Canvas3DBaseProps>;

/**
 * Wraps @react-three/fiber’s <Canvas /> and handles lights and if it has to be interactive or not.
 * Beside the defined parameters, the additional props are passed to the three/fiber <Canvas /> component.
 *
 * @param defaultLightOff Disables default ambient + directional lights
 * @param nonInteractive If true, disables default camera controls
 */
export const Canvas3D: React.FC<Canvas3DProps> = ({
  children,
  defaultLightOff = false,
  nonInteractive = false,
  ...canvasProps
}) => {
  return (
    <Canvas frameloop={"demand"} {...canvasProps}>
      {!defaultLightOff && (
        <>
          <ambientLight intensity={0.5} />
          <directionalLight />
        </>
      )}
      {children}
      {!nonInteractive && <CameraControls />}
    </Canvas>
  );
};

/**
 *
 * @param loader
 * @param urls
 * @param onLoadError
 * @param onProgress
 * @returns
 */
export const useParallelLoader = <T,>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: new (...args: any[]) => Loader<T>,
  urls: string[] | string,
  onLoadError?: (url, error) => void,
  onProgress?: (url, event: ProgressEvent<EventTarget>) => void
  // onLoadSuccess?: () => void
): Record<string, any> => {
  const [objects, setObjects] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPromise, setLoadingPromise] = useState<Promise<
    Record<string, T>
  > | null>(null);

  // Use useRef to store the previous URLs and track loading state
  const prevUrlsRef = useRef<string[]>([]);
  const [urlsToLoad, setUrlsToLoad] = useState<string[]>([]);

  // Convert to array and check if URLs changed
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const urlsChanged =
    prevUrlsRef.current.length !== urlArray.length ||
    prevUrlsRef.current.some((url, index) => url !== urlArray[index]);

  // Update URLs to load when they change
  if (urlsChanged) {
    prevUrlsRef.current = [...urlArray];
    setUrlsToLoad([...urlArray]);
    setObjects({}); // Clear previous objects when URLs change
  }

  useEffect(() => {
    if (urlsToLoad.length === 0) {
      return;
    }

    setIsLoading(true);
    const _loader = new loader();

    // Create the loading promise
    const promise = (async (): Promise<Record<string, T>> => {
      const loadPromises = urlsToLoad.map(
        (url) =>
          new Promise<{ url: string; object: T | null }>((resolve) => {
            _loader.load(
              url,
              (geometry) => {
                resolve({ url, object: geometry });
              },
              (event) => onProgress?.(url, event),
              (error) => {
                if (!onLoadError) {
                  console.error(`Error loading ${url}:`, error);
                } else {
                  onLoadError(url, error);
                }
                resolve({ url, object: null });
              }
            );
          })
      );

      // Wait for all promises to finish
      const results = await Promise.allSettled(loadPromises);

      // Create URL-to-object mapping
      const urlToObjectMap: Record<string, T> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.object) {
          urlToObjectMap[result.value.url] = result.value.object;
        }
      });

      return urlToObjectMap;
    })();

    // Set the loading promise and handle completion
    setLoadingPromise(promise);

    promise.then((loadedObjects) => {
      setObjects(loadedObjects);
      setIsLoading(false);
      setLoadingPromise(null);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlsToLoad]);

  // Suspense pattern: throw promise if loading
  if (isLoading && loadingPromise) {
    throw loadingPromise;
  }
  return objects;
};
