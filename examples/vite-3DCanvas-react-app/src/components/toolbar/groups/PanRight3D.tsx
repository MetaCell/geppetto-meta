import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { useCameraControls } from "../CameraControlsContext";

const PanRight3D: React.FC = () => {
  const cameraControlsRef = useCameraControls();

  const handlePanRight = (fiber: any) => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.truck(0.5, 0, true);
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      const moveDistance = 1;
      camera.position.x += moveDistance;
      camera.updateMatrixWorld();
    }
  };

  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-right" />}
      tooltip="Pan Right"
      onClick={handlePanRight}
    />
  );
};

export default PanRight3D;
