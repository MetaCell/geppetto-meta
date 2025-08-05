import {
  Canvas,
  CanvasProps,
  MeshProps,
  MeshStandardMaterialProps,
  ThreeEvent,
} from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";

import { CameraControls, Center, Outlines } from "@react-three/drei";
import { type FC, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  BufferGeometry,
  DoubleSide,
  Group,
  Loader,
  Mesh,
  NormalBlending,
} from "three";

/**
 * Represents a single 3D model to load.
 */
export interface Object3D {
  id?: string;
  url: string;
  opts?: {
    material?: MeshStandardMaterialProps;
    mesh?: MeshProps;
  };
  highlightOnClick?:
    | {
        thickness?: number;
        color?: string;
      }
    | boolean;
  loader?: new (...args: any[]) => Loader<BufferGeometry>;
  onMeshClick?: (
    object: Mesh,
    id: string,
    event: ThreeEvent<MouseEvent>
  ) => void;
  disableMeshClick?: boolean;
}

type Object3DViewerProps = {
  objects: Object3D[];
  frustumCulled?: boolean;
  onLoadSuccess?: () => void;
  onLoadError?: (reasons: Array<{ error: Error; object: Object3D }>) => void;
  onMeshClick?: (
    object: Mesh,
    id: string,
    event: ThreeEvent<MouseEvent>
  ) => void;
  disableMeshClick?: boolean;
};

/**
 * Props for the internal three.js/fiber component which represents a single 3D mesh.
 */
type Mesh3DProps = {
  id: string;
  object: BufferGeometry;
  materialOpts: MeshStandardMaterialProps;
  meshOpts: MeshProps;
  highlightOnClick?:
    | {
        thickness?: number;
        color?: string;
      }
    | boolean;
  onClick?: (object: Mesh, id: string, event: ThreeEvent<MouseEvent>) => void;
};

type Canvas3DBaseProps = {
  children?;
  defaultLightOff?: boolean;
  object3dUrls?: Array<Object3D | string>;
  onLoadSuccess?: () => void;
  onLoadError?: (reasons: Array<{ error: Error; object: Object3D }>) => void;
  nonInteractive?: boolean;
  onMeshClick?: (
    object: Mesh,
    id: string,
    event: ThreeEvent<MouseEvent>
  ) => void;
};

type Canvas3DProps = Canvas3DBaseProps &
  Omit<CanvasProps, keyof Canvas3DBaseProps>;

const loadMesh = (
  objects,
  loader,
  onSuccess?: (loaded: any[]) => void,
  onError?: (reasons: Array<{ error: Error; object: Object3D }>) => void
) => {
  const loadPromises = objects.map((object) => {
    return loader.loadAsync(object.url).then((result) => {
      if ((result as Group).isGroup) {
        const meshes = (result as Group).children.filter(
          (child): child is Mesh => (child as Mesh).isMesh
        );

        if (meshes.length === 0) {
          throw new Error(`OBJ ${object.url} contains no mesh children`);
        }

        return meshes.map((mesh) => ({
          geometry: mesh.geometry,
          object,
        }));
      }

      return [{ geometry: result, object }];
    });
  });
  Promise.allSettled(loadPromises).then((results) => {
    const [ok, nok] = results.reduce(
      (acc, r) => {
        if (r.status === "fulfilled" && r.value) {
          acc[0].push(r.value);
        } else if (r.status === "rejected") {
          acc[1].push(r.reason);
        }
        return acc;
      },
      [[], []]
    );
    if (nok && nok.length > 0) {
      onError?.(nok);
    } else {
      onSuccess?.(ok.flat());
    }
  });
};

const groupByExtension = (items: Array<Object3D>) => {
  return items.reduce<Record<string, { loader: any; items: Object3D[] }>>(
    (acc, item) => {
      const match = item.url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
      const ext = match ? match[1].toLowerCase() : "unknown";

      let loader = item.loader || Loaders[ext];
      if (loader === undefined) {
        loader = Loaders.default;
      }

      if (!acc[ext]) {
        acc[ext] = { loader, items: [] };
      }

      acc[ext].items.push(item);
      return acc;
    },
    {}
  );
};

/**
 * Loads and renders multiple 3D models, each specified by Object3D.
 * The component groups the 3D objects by file extension, auto-select the appropriate loaders (STLLoader, OBJLoader, ...).
 * By default, loaded meshes are clickable unless `disableMeshClick` is set
 *
 * @param objects The list of 3D objects/models that needs to be loaded
 * @param onMeshClick Global callback called when a 3D object/model is clicked on (can be disabled by 3D object)
 * @param frustumCulled When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object. If set to false the object gets rendered every frame even if it is not in the frustum of the camera
 * @param onLoadSuccess Callback called when all the 3D objects/models are loaded/fetched
 * @param onLoadError Callback called if an error occurs during the fetch of the 3D objects/models
 */
const Object3DViewer: FC<Object3DViewerProps> = ({
  frustumCulled,
  objects,
  onLoadSuccess,
  onLoadError,
  onMeshClick,
}) => {
  const [_3DObjects, set3DObjects] = useState<
    Array<{ geometry: BufferGeometry; object: Object3D }>
  >([]);
  const objectsByExtension = useRef(groupByExtension(objects));

  useEffect(() => {
    const loaders = Object.values(objectsByExtension.current);

    const promises = loaders.map(({ loader, items }) => {
      return new Promise<void>((resolve) => {
        loadMesh(
          items,
          new loader(),
          (objs) => {
            set3DObjects((prev) => [...prev, ...objs]);
            resolve();
          },
          (reasons) => {
            onLoadError?.(reasons);
            resolve();
          }
        );
      });
    });

    Promise.all(promises).then(() => {
      onLoadSuccess?.();
    });
  }, [objects]);

  const meshes = useMemo(() => {
    return _3DObjects.map(({ object, geometry }) => {
      const clickHandler = object.disableMeshClick
        ? undefined
        : object.onMeshClick || onMeshClick;
      return (
        <Mesh3D
          key={object.id || object.url}
          id={object.id || object.url}
          object={geometry}
          meshOpts={object?.opts?.mesh}
          materialOpts={object?.opts?.material}
          highlightOnClick={object.highlightOnClick}
          onClick={clickHandler}
        />
      );
    });
  }, [_3DObjects, onMeshClick]);

  return <group frustumCulled={frustumCulled || false}>{meshes}</group>;
};

/**
 * Renders a single mesh using geometry, material, and optional click interaction.
 * This component supports highlightOnClick with customizable outline thickness and color.
 * Lower-level materials and meshes can be customized via meshOpts and materialOpts
 *
 * @param id the ID of the 3D mesh (usually the remote 3D object URL)
 * @param object the 3D object representation (URL and specific configuration)
 * @param highlightOnClick enables the outline when the 3D model is clicked
 * @param onClick Callback called when the 3D model is clicked
 * @param meshOpts three.js/fiber options that will be passed to the underlying three.js mesh object
 * @param materialOpts three.js/fiber options that will be passed to the underlying three.js material of the three.js mesh object
 */
const Mesh3D: FC<Mesh3DProps> = ({
  id,
  highlightOnClick,
  onClick,
  object,
  meshOpts,
  materialOpts,
}) => {
  const [highlighted, setHighlight] = useState(false);
  const objMesh = useRef(null);

  const _onClick = (event: ThreeEvent<MouseEvent>) => {
    if (highlightOnClick) {
      setHighlight(!highlighted);
    }

    onClick?.(objMesh.current, id, event);
  };

  return (
    <Center>
      <mesh
        ref={objMesh}
        {...meshOpts}
        userData={{ id }}
        frustumCulled={meshOpts?.frustumCulled || false}
        onClick={_onClick}
      >
        <primitive attach="geometry" object={object} />
        <meshStandardMaterial
          {...materialOpts}
          color={materialOpts?.color || "red"}
          opacity={materialOpts?.opacity || 1}
          side={materialOpts?.side || DoubleSide}
          depthWrite={materialOpts?.depthWrite || false}
          depthTest={materialOpts?.depthTest || false}
          blending={materialOpts?.blending || NormalBlending}
        />
        {highlighted && (
          <Outlines
            thickness={(highlightOnClick as any)?.thickness || 5}
            color={(highlightOnClick as any)?.color || "hotpink"}
          />
        )}
      </mesh>
    </Center>
  );
};

/**
 * Maps 3D file extension to dedicated loaders
 * You can override the loader per object using the loader property.
 */
const Loaders = {
  stl: STLLoader,
  obj: OBJLoader,
  unknown: OBJLoader,
  default: OBJLoader,
};

/**
 * Wraps @react-three/fiber’s <Canvas /> and handles lighting, interactivity, and model loading.
 * Beside the defined parameters, the additional props are passed to the three/fiber <Canvas /> component.
 *
 * @param object3dUrls Array of 3D object URLs or Object3D configs
 * @param defaultLightOff Disables default ambient + directional lights
 * @param onLoadSuccess onLoadError: Callbacks for model loading
 * @param nonInteractive If true, disables default camera controls
 * @param onMeshClick Global click callback for meshes (handles all clicked mesh)
 */
export const Canvas3D: React.FC<Canvas3DProps> = ({
  children,
  defaultLightOff = false,
  object3dUrls,
  onLoadError,
  nonInteractive = false,
  onLoadSuccess,
  onMeshClick,
  ...canvasProps
}) => {
  return (
    <Canvas {...canvasProps}>
      {!defaultLightOff && (
        <>
          <ambientLight intensity={0.5} />
          <directionalLight />
        </>
      )}
      {object3dUrls && (
        <Object3DViewer
          objects={object3dUrls.map((o) => {
            if (typeof o === "string") {
              return { url: o };
            }
            return o;
          })}
          onLoadError={onLoadError}
          onLoadSuccess={onLoadSuccess}
          onMeshClick={onMeshClick}
        />
      )}
      {children}
      {!nonInteractive && <CameraControls />}
    </Canvas>
  );
};
