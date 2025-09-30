import React, { useRef, useState } from "react";
import {
  Canvas3D,
  Canvas3DRootState,
} from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import {
  Toolbar3D,
  Toolbar3DButton,
  Toolbar3DSeparator,
} from "../toolbar/Toolbar3D";
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

  const handleCameraClick = ({ controls, camera }: Canvas3DRootState) => {
    console.debug("My Controls is", controls);
    console.debug("My Camera is", camera);
    console.log("Current activeCamera state:", activeCamera);

    setActiveCamera(!activeCamera);

    if (controls) {
      if (!activeCamera) {
        console.log("Setting focus position...");

        /* prettier-ignore */
        controls.setLookAt(
          5, 5, 5,  // Camera position
          0, 0, 0,  // Look at center
          true      // Enable animation
        );
      } else {
        console.log("Resetting camera...");
        controls.reset(true);
      }
    } else {
      console.log("CameraControls ref is null!");
    }
  };

  const Scene = () => (
    <>
      <MyRotatingBox />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[10, 10]} />
    </>
  );

  return (
    <>
      <Box style={{ display: "flex", width: "100%" }}>
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
        <Box sx={classes.canvasContainer}>
          <Canvas3D
            frameloop={"always"}
            controlsOption={{
              minDistance: 2,
              maxDistance: 20,
              enablePan: true,
              enableZoom: true,
              enableRotate: true,
            }}
            defaultLightOff
          >
            <Scene />
          </Canvas3D>
        </Box>
      </Box>
    </>
  );
};

export default Canvas3DExample;
