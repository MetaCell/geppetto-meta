import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import type { Canvas3DRootState } from "../../Canvas3D";
import { PerspectiveCamera } from "three";

interface ZoomOptions {
  fovStep?: number;
  minFov?: number;
  maxFov?: number;
  dollyStep?: number;
}

interface EnhancedZoom3DButtonsProps {
  zoomOptions?: ZoomOptions;
}

const EnhancedZoom3DButtons: React.FC<EnhancedZoom3DButtonsProps> = ({
  zoomOptions = { fovStep: 5, minFov: 10, maxFov: 120, dollyStep: 0.5 },
}) => {
  const { fovStep, minFov, maxFov, dollyStep } = zoomOptions;

  const handleZoomIn = (fiber: Canvas3DRootState) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.max(camera.fov - fovStep, minFov);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleZoomOut = (fiber: Canvas3DRootState) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.min(camera.fov + fovStep, maxFov);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleDollyIn = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.dolly(-dollyStep, true);
    }
  };

  const handleDollyOut = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.dolly(dollyStep, true);
    }
  };

  return (
    <>
      <Toolbar3DButton
        icon={<i className="fas fa-search-plus" />}
        tooltip="Zoom In (FOV)"
        onClick={handleZoomIn}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-search-minus" />}
        tooltip="Zoom Out (FOV)"
        onClick={handleZoomOut}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-plus" />}
        tooltip="Dolly In (Move Closer)"
        onClick={handleDollyIn}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-minus" />}
        tooltip="Dolly Out (Move Away)"
        onClick={handleDollyOut}
      />
    </>
  );
};

export default EnhancedZoom3DButtons;
