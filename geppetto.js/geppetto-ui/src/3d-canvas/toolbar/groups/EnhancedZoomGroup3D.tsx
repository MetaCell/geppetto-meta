import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import type { Canvas3DRootState } from "../../Canvas3D";
import { PerspectiveCamera } from "three";

const EnhancedZoom3DButtons: React.FC = () => {
  const handleZoomIn = (fiber: Canvas3DRootState) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.max(camera.fov - 5, 10);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleZoomOut = (fiber: Canvas3DRootState) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera instanceof PerspectiveCamera) {
        camera.fov = Math.min(camera.fov + 5, 120);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleDollyIn = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.dolly(-0.5, true);
    }
  };

  const handleDollyOut = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.dolly(0.5, true);
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
