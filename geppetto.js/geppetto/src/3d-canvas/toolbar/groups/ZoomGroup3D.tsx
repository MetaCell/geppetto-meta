import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "../../Canvas3D";
import { PerspectiveCamera, OrthographicCamera } from "three";

interface ZoomOptions {
  fovStep?: number;
  minFov?: number;
  maxFov?: number;
  minZoom?: number;
  zoomMultiplier?: number;
  maxZoom?: number;
}

const Zoom3DButtons: React.FC = () => {
  const handleZoomIn = (
    fiber: Canvas3DRootState,
    { fovStep = 5, minFov = 10, zoomMultiplier = 1.1, maxZoom = 10 }: ZoomOptions = {},
  ) => {
    if (fiber?.controls && fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.max(camera.fov - fovStep, minFov);
        camera.updateProjectionMatrix();
      }
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.max(camera.fov - fovStep, minFov);
        camera.updateProjectionMatrix();
      } else if (camera instanceof OrthographicCamera) {
        camera.zoom = Math.min(camera.zoom * zoomMultiplier, maxZoom);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleZoomOut = (
    fiber: Canvas3DRootState,
    { fovStep = 5, maxFov = 120, zoomMultiplier = 0.9, minZoom = 0.1 }: ZoomOptions = {},
  ) => {
    if (fiber?.controls && fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.min(camera.fov + fovStep, maxFov);
        camera.updateProjectionMatrix();
      }
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.min(camera.fov + fovStep, maxFov);
        camera.updateProjectionMatrix();
      } else if (camera instanceof OrthographicCamera) {
        camera.zoom = Math.max(camera.zoom * zoomMultiplier, minZoom);
        camera.updateProjectionMatrix();
      }
    }
  };

  return (
    <>
      <Toolbar3DButton
        icon={<i className="fas fa-magnifying-glass-plus" />}
        tooltip="Zoom In"
        onClick={handleZoomIn}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-magnifying-glass-minus" />}
        tooltip="Zoom Out"
        onClick={handleZoomOut}
      />
    </>
  );
};

export default Zoom3DButtons;
