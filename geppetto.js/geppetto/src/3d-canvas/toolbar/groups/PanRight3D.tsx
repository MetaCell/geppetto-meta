import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "../../Canvas3D";

interface PanRight3DProps {
  distance?: number;
  useTransition?: boolean;
}

const PanRight3D: React.FC<{ panOptions?: PanRight3DProps }> = ({ panOptions }) => {
  const { distance = 0.5, useTransition = true } = panOptions || {};

  const handlePanRight = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.truck(distance, 0, useTransition);
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
