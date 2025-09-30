import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { useCameraControls } from "../CameraControlsContext";

const Forward3D: React.FC = () => {
  const cameraControlsRef = useCameraControls();

  const handleForward = (fiber: any) => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.dolly(-0.5, true);
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      const moveDistance = 1;
      camera.position.z -= moveDistance;
      camera.updateMatrixWorld();
    }
  };

  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-up" />}
      tooltip="Move Forward"
      onClick={handleForward}
    />
  );
};

export default Forward3D;
