import * as THREE from "three-latest";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useState } from "react";

console.log("THREE Version:", THREE.REVISION); // Check the version

type Canvas3DProps = {
  children?;
  defaultLightOff?: boolean;
};

export const Canvas3D: React.FC<Canvas3DProps> = ({
  children,
  defaultLightOff = false,
}) => {
  return (
    <div id="canvas-container">
      <Canvas>
        {!defaultLightOff && <ambientLight intensity={0.1} />}
        {!defaultLightOff && <directionalLight />}
        {children}
      </Canvas>
    </div>
  );
};
