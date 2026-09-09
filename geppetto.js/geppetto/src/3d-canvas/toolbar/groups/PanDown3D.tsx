import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "../../Canvas3D";
import * as THREE from "three";

interface PanDown3DProps {
  distance?: number;
  useTransition?: boolean;
}

const PanDown3D: React.FC<{ panOptions?: PanDown3DProps }> = ({ panOptions }) => {
  const { distance = 0.5, useTransition = true } = panOptions || {};

  const handlePanDown = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.truck(0, -distance, useTransition);
    } else if (fiber?.camera) {
      const camera = fiber.camera;
      const right = new THREE.Vector3();
      camera.getWorldDirection(right);
      right.cross(camera.up).normalize();

      const moveDistance = 1;
      camera.position.add(right.multiplyScalar(-moveDistance));
    } else {
      console.log("No camera controls or camera found!");
    }
  };

  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-down" />}
      tooltip="Pan Down"
      onClick={handlePanDown}
    />
  );
};

export default PanDown3D;
