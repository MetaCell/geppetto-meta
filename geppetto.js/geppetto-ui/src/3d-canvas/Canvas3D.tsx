import { Canvas, CanvasProps, useThree } from "@react-three/fiber";
import React, { forwardRef, useEffect, useRef } from "react";

import { RootState } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useState } from "react";
import { Loader } from "three";
import create from "zustand";

export type FiberRootState = RootState;
type Canvas3DBaseProps = {
  id?: string;
  children?;
  ref?;
  defaultLightOff?: boolean;
  nonInteractive?: boolean;
};

type Canvas3DProps = Canvas3DBaseProps &
  Omit<CanvasProps, keyof Canvas3DBaseProps>;

/**
 * Hook that lets you load multiple 3D objects in parallel using a specified loader.
 *
 * If an error occurs during loading of a URL, the onLoadError callback is called with the URL and error details, but the loading continues for other URLs.
 *
 * @param loader The loader class to use for loading (e.g., STLLoader, OBJLoader)
 * @param urls the URL or array of URLs to load
 * @param loaderInit the callback function that is called just after creating the loader.
 * @param progress an object that contains 3 optional keys: onError, onProgress, onFinish.
 * @param onError the callback function that is called when an error occurs during loading of a URL.
 * @param onProgress the callback function that is called to report progress during loading of a URL.
 * @param onFinish the callback function that is called to report that the object at an URL loaded properly.
 * @returns an object mapping each URL to its loaded 3D object. If a URL failed to load, it will not be included in the returned object.
 */
export const useParallelLoader = <T,>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: new (...args: any[]) => Loader<T>,
  urls: string[] | string,
  loaderInit?: (loader) => void,
  progress?: {
    onError?: (url, error) => void;
    onProgress?: (url, event: ProgressEvent<EventTarget>) => void;
    onFinish?: (url) => void;
  }
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
    loaderInit?.(_loader);

    // Create the loading promise
    const promise = (async (): Promise<Record<string, T>> => {
      const loadPromises = urlsToLoad.map(
        (url) =>
          new Promise<{ url: string; object: T | null }>((resolve) => {
            _loader.load(
              url,
              (geometry) => {
                progress?.onFinish?.(url);
                resolve({ url, object: geometry });
              },
              (event) => progress?.onProgress?.(url, event),
              (error) => {
                if (!progress?.onError) {
                  console.error(`Error loading ${url}:`, error);
                } else {
                  progress?.onError(url, error);
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

/**
 * Wraps @react-three/fiber’s <Canvas /> and handles lights and if it has to be interactive or not.
 * Beside the defined parameters, the additional props are passed to the three/fiber <Canvas /> component.
 *
 * By default, the fameloop is set to "demand" to optimize performance, and can be overridden via props.
 * By default, ambient and directional lights are added, but can be disabled via props.
 *
 * @param defaultLightOff Disables default ambient + directional lights (default: false)
 * @param nonInteractive If true, disables default camera controls (default: false)
 */
export const Canvas3D: React.FC<Canvas3DProps> = forwardRef<
  HTMLCanvasElement,
  Canvas3DBaseProps
>(
  (
    {
      id = undefined,
      children,
      defaultLightOff = false,
      nonInteractive = false,
      ...canvasProps
    },
    ref
  ) => {
    return (
      <Canvas ref={ref} frameloop={"demand"} {...canvasProps}>
        <FiberBridge storeId={id} />
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
  }
);

type FiberStore = {
  rootStates: Record<string, RootState | null>;
  setRootState: (id: string, state: RootState) => void;
  clearRootState: (id: string) => void;
};

export const useFiberStore = create<FiberStore>((set) => ({
  rootStates: {},

  setRootState: (id, state) =>
    set((prev) => ({
      rootStates: {
        ...prev.rootStates,
        [id]: state,
      },
    })),

  clearRootState: (id) =>
    set((prev) => {
      const { [id]: _, ...rest } = prev.rootStates;
      return { rootStates: rest };
    }),
}));

export const useFiber = (id: string) =>
  useFiberStore((s) => s.rootStates[id] ?? null);

const FiberBridge: React.FC<{ storeId?: string }> = ({ storeId }) => {
  const state = useThree();
  const id = storeId ?? "default";
  const setRootState = useFiberStore((s) => s.setRootState);
  const clearRootState = useFiberStore((s) => s.clearRootState);

  React.useEffect(() => {
    setRootState(id, state);
    return () => {
      clearRootState(id);
    };
  }, [id, state, setRootState, clearRootState]);

  return null;
};
