import React, { useRef, useState } from "react";
import { Canvas3D } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Toolbar3DButton, Toolbar3D, Toolbar3DSeparator } from "../toolbar";
import {
  Navigation3D,
  Zoom3DButtons,
  Animation3DControls,
} from "../toolbar/groups";
import * as THREE from "three";

console.log("three.js for 3D view", THREE.REVISION);

const classes = {
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
  },
  canvasContainer: {
    flex: 1,
    position: "relative" as const,
  },
};

function MyRotatingBox() {
  const myMesh = useRef<Mesh>();
  const [active, setActive] = useState(false);

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    myMesh.current.rotation.x = a;
  });

  return (
    <mesh
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      ref={myMesh}
    >
      <boxGeometry />
      <meshPhongMaterial color="royalblue" />
    </mesh>
  );
}

const Canvas3DExample: React.FC = () => {
  return (
    <>
      <Box style={{ display: "flex", width: "100%" }}>
        <Toolbar3D>
          <Navigation3D />
          <Toolbar3DSeparator />
          <Zoom3DButtons />
          <Toolbar3DSeparator />
          <Animation3DControls />
          <Toolbar3DSeparator />
          <Toolbar3DButton
            icon={<i className="fas fa-camera" />}
            tooltip="Camera"
            onClick={({ camera }) => console.log("Camera clicked", camera)}
          />
        </Toolbar3D>
        <Box sx={classes.canvasContainer}>
          <Canvas3D frameloop={"always"}>
            <MyRotatingBox />
          </Canvas3D>
        </Box>
      </Box>
      {/* <Box style={{ display: "flex", width: "100%" }}>
        <Toolbar3D canvasId="canvas02">
          <Navigation3D />
          <Toolbar3DSeparator />
          <Zoom3DButtons />
          <Toolbar3DSeparator />
          <Animation3DControls />
          <Toolbar3DSeparator />
          <Toolbar3DButton
            icon={<i className="fas fa-camera" />}
            tooltip="Camera"
            onClick={() => console.log("Camera clicked")}
          />
        </Toolbar3D>
        <Box sx={classes.canvasContainer}>
          <Canvas3D id="canvas02" frameloop={"always"}>
            <MyRotatingBox />
          </Canvas3D>
        </Box>
      </Box> */}
    </>
  );
};

export default Canvas3DExample;
