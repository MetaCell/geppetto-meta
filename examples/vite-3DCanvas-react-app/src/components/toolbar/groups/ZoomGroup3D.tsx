import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { useCameraControls } from "../CameraControlsContext";

const Zoom3DButtons: React.FC = () => {
  const cameraControlsRef = useCameraControls();

  const handleZoomIn = (fiber: any) => {
    console.log("Zoom In clicked!");
    
    if (cameraControlsRef?.current && fiber?.camera) {
      // TRUE ZOOM: Change FOV, not camera position
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.max(camera.fov - 5, 10); // Decrease FOV = zoom in
        camera.updateProjectionMatrix();
        console.log("Zoomed in using FOV change");
      }
    } else if (fiber?.camera) {
      // Fallback zoom logic
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.max(camera.fov - 5, 10);
        camera.updateProjectionMatrix();
      } else if (camera.isOrthographicCamera) {
        camera.zoom = Math.min(camera.zoom * 1.1, 10);
        camera.updateProjectionMatrix();
      }
    }
  };

  const handleZoomOut = (fiber: any) => {
    console.log("Zoom Out clicked!");
    
    if (cameraControlsRef?.current && fiber?.camera) {
      // TRUE ZOOM: Change FOV, not camera position
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.min(camera.fov + 5, 120); // Increase FOV = zoom out
        camera.updateProjectionMatrix();
        console.log("Zoomed out using FOV change");
      }
    } else if (fiber?.camera) {
      // Fallback zoom logic
      const camera = fiber.camera;
      if (camera.isPerspectiveCamera) {
        camera.fov = Math.min(camera.fov + 5, 120);
        camera.updateProjectionMatrix();
      } else if (camera.isOrthographicCamera) {
        camera.zoom = Math.max(camera.zoom * 0.9, 0.1);
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
