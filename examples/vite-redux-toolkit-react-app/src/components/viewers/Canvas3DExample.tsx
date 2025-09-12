import React, { Suspense, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { CameraControls, Center, Html } from "@react-three/drei";
import { Mesh } from "three";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import {
  Canvas3D,
  useParallelLoader,
} from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";

console.log("three.js for 3D view", THREE.REVISION);

const classes = {
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "stretch",
  },
};

function MyRotatingBox() {
  const myMesh = useRef<Mesh>();
  const [active, setActive] = useState(false);
  const [switchColor, setSwitchColor] = useState(false);

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    myMesh.current.rotation.x = a;
  });

  return (
    <mesh
      scale={active ? 5 : 1}
      onClick={() => {
        setActive(!active);
        setSwitchColor((prev) => !prev);
      }}
      ref={myMesh}
      position={[10, 10, 10]}
    >
      <boxGeometry />
      <meshPhongMaterial color={switchColor ? "royalblue" : "hotpink"} />
    </mesh>
  );
}

const Canvas3DExample: React.FC = () => {
  return (
    <Box className={classes.container} style={classes.container}>
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas3DContent />
      </Suspense>
    </Box>
  );
};

const Canvas3DContent: React.FC = () => {
  const urls = [
    `http://localhost:${window.location.port}/ADAL.stl`,
    `http://localhost:${window.location.port}/nervering.stl`,
    `http://localhost:${window.location.port}/n.stl`,
  ];

  const stlGeometries = useParallelLoader(
    STLLoader,
    urls,
    (url, error) => {
      console.debug("ERROR LOADING STL", url, error);
    },
    (url, event) => {
      console.debug("STL LOAD PROGRESS", url, event);
    }
  );
  const objGroups = useParallelLoader(
    OBJLoader,
    `http://localhost:${window.location.port}/2.obj`
  );

  return (
    <Canvas3D frameloop={"always"}>
      <group>
        <Center>
          {Object.entries(stlGeometries).map(([url, geometry]) => (
            <mesh key={url}>
              <primitive attach="geometry" object={geometry} />
              <meshStandardMaterial transparent={true} opacity={0.3} />
            </mesh>
          ))}
          {Object.entries(objGroups).map(([url, group]) => (
            <primitive key={url} object={group} />
          ))}
        </Center>
      </group>
      <MyRotatingBox />
    </Canvas3D>
  );
};

export default Canvas3DExample;
