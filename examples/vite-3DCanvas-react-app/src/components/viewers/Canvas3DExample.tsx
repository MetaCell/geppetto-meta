import React, { useRef, useState } from "react";
import { Canvas3D } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { CameraControls } from "@react-three/drei";
import { Toolbar3D, Toolbar3DButton, Toolbar3DSeparator } from "../toolbar/Toolbar3D";
import { CameraControlsProvider } from "../toolbar/CameraControlsContext";
import {
  Navigation3D,
  EnhancedZoom3DButtons,
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
  const [activeCamera, setActiveCamera] = useState(false);
  const cameraControlsRef = useRef<CameraControls>(null);

  const handleCameraClick = (fiber: any) => {
    console.log("Camera clicked", fiber.camera);
    console.log("Current activeCamera state:", activeCamera);
    console.log("CameraControls ref:", cameraControlsRef.current);

    setActiveCamera(!activeCamera);

    if (cameraControlsRef.current) {
      if (!activeCamera) {
        console.log("Setting focus position...");
        cameraControlsRef.current.setLookAt(
          5, 5, 5,  // Camera position
          0, 0, 0,  // Look at center
          true      // Enable animation
        );
      } else {
        console.log("Resetting camera...");
        cameraControlsRef.current.reset(true);
      }
    } else {
      console.log("CameraControls ref is null!");
    }
  };

  const Scene = () => (
    <>
      <CameraControls
        ref={cameraControlsRef}
        minDistance={2}
        maxDistance={20}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      <MyRotatingBox />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[10, 10]} />
    </>
  );

  return (
    <>
      <Box style={{ display: "flex", width: "100%" }}>
        <CameraControlsProvider cameraControlsRef={cameraControlsRef}>
          <Toolbar3D>
            <Navigation3D />
            <Toolbar3DSeparator />
            <EnhancedZoom3DButtons />
            <Toolbar3DSeparator />
            <Animation3DControls />
            <Toolbar3DSeparator />
            <Toolbar3DButton
              icon={<i className="fas fa-camera" />}
              tooltip={activeCamera ? "Reset Camera" : "Focus Camera"}
              onClick={handleCameraClick}
              active={activeCamera}
            />
          </Toolbar3D>
        </CameraControlsProvider>
        <Box sx={classes.canvasContainer}>
          <Canvas3D frameloop={"always"} nonInteractive={true}>
            <Scene />
          </Canvas3D>
        </Box>
      </Box>
    </>
  );
};

export default Canvas3DExample;
