import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { useCameraControls } from "../CameraControlsContext";

const EnhancedZoom3DButtons: React.FC = () => {
  const cameraControlsRef = useCameraControls();

  const handleZoomIn = (fiber: any) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.max(camera.fov - 5, 10);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleZoomOut = (fiber: any) => {
    if (fiber?.camera) {
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.min(camera.fov + 5, 120);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleDollyIn = (_fiber: any) => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.dolly(-0.5, true);
    }
  };

  const handleDollyOut = (_fiber: any) => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.dolly(0.5, true);
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