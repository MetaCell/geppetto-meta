import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";
import { Canvas3DRootState } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import * as THREE from "three";

const PanLeft3D: React.FC = () => {
  const handlePanLeft = (fiber: Canvas3DRootState) => {
    if (fiber?.controls) {
      fiber.controls.truck(-0.5, 0, true);
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
      icon={<i className="fas fa-arrow-left" />}
      tooltip="Pan Left"
      onClick={handlePanLeft}
    />
  );
};

export default PanLeft3D;
