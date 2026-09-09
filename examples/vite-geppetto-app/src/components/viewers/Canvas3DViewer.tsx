import React, { Suspense, useRef } from "react";
import { Box } from "@mui/material";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import type { Mesh } from "three";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Canvas3D,
  Toolbar3D,
  Toolbar3DButton,
  Toolbar3DSeparator,
  type Canvas3DRootState,
} from "@metacell/geppetto";

const CANVAS_ID = "geppetto-canvas-3d";
const FOV_STEP = 5;
const PAN_STEP = 0.4;

/*
 * Simple demo scene: a box that slowly rotates around Y and X axes.
 * The Canvas3D default lights (ambient + directional) illuminate it.
 */
function RotatingBox() {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.x = t * 0.2;
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1568D5" />
    </mesh>
  );
}

const Canvas3DViewer: React.FC = () => (
  <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
    {/* Toolbar — buttons use MUI icons so no fontawesome dependency needed */}
    <Toolbar3D canvasId={CANVAS_ID} sx={{ width: 40, padding: "4px 0", gap: "2px" }}>
      <Toolbar3DButton
        icon={<ZoomInIcon fontSize="small" />}
        tooltip="Zoom in"
        onClick={(fiber: Canvas3DRootState) => {
          const cam = fiber.camera as PerspectiveCamera;
          if ("fov" in cam) {
            cam.fov = Math.max(cam.fov - FOV_STEP, 10);
            cam.updateProjectionMatrix();
            fiber.invalidate();
          }
        }}
      />
      <Toolbar3DButton
        icon={<ZoomOutIcon fontSize="small" />}
        tooltip="Zoom out"
        onClick={(fiber: Canvas3DRootState) => {
          const cam = fiber.camera as PerspectiveCamera;
          if ("fov" in cam) {
            cam.fov = Math.min(cam.fov + FOV_STEP, 120);
            cam.updateProjectionMatrix();
            fiber.invalidate();
          }
        }}
      />
      <Toolbar3DSeparator />
      <Toolbar3DButton
        icon={<ArrowUpwardIcon fontSize="small" />}
        tooltip="Pan up"
        onClick={(fiber: Canvas3DRootState) => fiber.controls?.truck(0, PAN_STEP, true)}
      />
      <Toolbar3DButton
        icon={<ArrowDownwardIcon fontSize="small" />}
        tooltip="Pan down"
        onClick={(fiber: Canvas3DRootState) => fiber.controls?.truck(0, -PAN_STEP, true)}
      />
      <Toolbar3DButton
        icon={<ArrowBackIcon fontSize="small" />}
        tooltip="Pan left"
        onClick={(fiber: Canvas3DRootState) => fiber.controls?.truck(-PAN_STEP, 0, true)}
      />
      <Toolbar3DButton
        icon={<ArrowForwardIcon fontSize="small" />}
        tooltip="Pan right"
        onClick={(fiber: Canvas3DRootState) => fiber.controls?.truck(PAN_STEP, 0, true)}
      />
      <Toolbar3DSeparator />
      <Toolbar3DButton
        icon={<RestartAltIcon fontSize="small" />}
        tooltip="Reset camera"
        onClick={(fiber: Canvas3DRootState) => fiber.controls?.reset(true)}
      />
    </Toolbar3D>

    {/* Canvas — frameloop="always" so the rotation animation plays continuously */}
    <Box sx={{ flexGrow: 1, height: "100%" }}>
      <Canvas3D id={CANVAS_ID} frameloop="always" style={{ width: "100%", height: "100%" }}>
        <Suspense fallback={null}>
          <RotatingBox />
        </Suspense>
      </Canvas3D>
    </Box>
  </Box>
);

export default Canvas3DViewer;
