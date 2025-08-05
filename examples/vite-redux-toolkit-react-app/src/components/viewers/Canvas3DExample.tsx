import React, { useRef, useState } from "react";
import { Canvas3D } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

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
    <Box className={classes.container} style={classes.container}>
      <Canvas3D
        object3dUrls={[
          {
            url: `http://localhost:${window.location.port}/ADAL.stl`,
            opts: {
              material: {
                color: "green",
                transparent: true,
                opacity: 0.5,
              },
            },
            highlightOnClick: true,
          },
          {
            url: `http://localhost:${window.location.port}/nervering.stl`,
            opts: {
              material: {
                flatShading: false,
                color: "hotpink",
                depthWrite: true,
                transparent: true,
                opacity: 0.3,
                side: THREE.FrontSide,
              },
            },
            // disableMeshClick: true,
            onMeshClick: (mesh, id, event) => {
              event.stopPropagation();
              console.debug("DEDICATED CLICK HANDLER");
              console.debug("MESH", mesh);
              console.debug("id", id);
              console.debug("event", event);
            },
          },
          `http://localhost:${window.location.port}/2.obj`,
        ]}
        onLoadError={(e) => console.debug(e)}
        onLoadSuccess={() => console.debug("All 3D objects loaded properly")}
        onMeshClick={(_, id) => console.debug("Global mesh handler click", id)}
      ></Canvas3D>
    </Box>
  );
};

export default Canvas3DExample;
