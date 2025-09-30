import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";

const Forward3D: React.FC = () => {
  const handleForward = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.dolly(-0.5, true);
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
