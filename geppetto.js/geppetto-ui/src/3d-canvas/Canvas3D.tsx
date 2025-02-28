import {
  Canvas,
  MeshProps,
  MeshStandardMaterialProps,
  ThreeEvent,
} from "@react-three/fiber";
import React, { useCallback, useEffect, useRef } from "react";

import { CameraControls, Center, Outlines } from "@react-three/drei";
import { type FC, useMemo, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { BufferGeometry, DoubleSide, Mesh, NormalBlending } from "three";

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
}

type STLViewerProps = {
  objects: Object3D[];
  frustumCulled?: boolean;
  onLoadError?: (reasons: Array<{ error: Error; object: Object3D }>) => void;
};

type STLMeshProps = {
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
  onClick?: (event: ThreeEvent<MouseEvent>, id: string, object: Mesh) => void;
};

type Canvas3DProps = {
  children?;
  defaultLightOff?: boolean;
  object3dUrls?: Array<Object3D | string>;
  onLoadError?: (reasons: Array<{ error: Error; object: Object3D }>) => void;
  nonInteractive?: boolean;
};

const STLViewer: FC<STLViewerProps> = ({
  frustumCulled,
  objects,
  onLoadError,
}) => {
  const [stlObjects, setSTLObjects] = useState<
    Array<{ geometry: BufferGeometry; object: Object3D }>
  >([]);
  const loaderRef = useRef(new STLLoader());

  useEffect(() => {
    const loader = loaderRef.current;

    const loadPromises = objects.map((object) => {
      return loader.loadAsync(object.url).then(
        (geometry) => ({ geometry, object }),
        (error) => Promise.reject({ error, object })
      );
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
      setSTLObjects(ok);
      if (nok && nok.length > 0) {
        onLoadError?.(nok);
      }
    });
  }, [objects]);

  return (
    <group frustumCulled={frustumCulled || false}>
      {stlObjects.map(({ object, geometry }) => (
        <STLMesh
          key={object.id || object.url}
          id={object.id || object.url}
          object={geometry}
          meshOpts={object?.opts?.mesh}
          materialOpts={object?.opts?.material}
          highlightOnClick={object.highlightOnClick}
        />
      ))}
    </group>
  );
};

export default STLViewer;

const STLMesh: FC<STLMeshProps> = ({
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
    onClick?.(event, id, objMesh.current);
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

export const Canvas3D: React.FC<Canvas3DProps> = ({
  children,
  defaultLightOff = false,
  object3dUrls,
  onLoadError,
  nonInteractive = false,
}) => {
  return (
    <Canvas>
      {!defaultLightOff && <ambientLight intensity={0.5} />}
      {!defaultLightOff && <directionalLight />}
      {object3dUrls && (
        <STLViewer
          objects={object3dUrls.map((o) => {
            if (typeof o === "string") {
              return { url: o };
            }
            return o;
          })}
          onLoadError={onLoadError}
        />
      )}
      {children}
      {!nonInteractive && <CameraControls />}
    </Canvas>
  );
};
