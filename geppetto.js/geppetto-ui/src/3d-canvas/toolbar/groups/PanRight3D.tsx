import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "../../Canvas3D";

const PanRight3D: React.FC = () => {
  const handlePanRight = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.truck(0.5, 0, true);
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
