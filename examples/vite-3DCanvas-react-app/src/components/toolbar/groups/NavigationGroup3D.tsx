import React from "react";
import PanLeft3D from "./PanLeft3D";
import PanRight3D from "./PanRight3D";
import PanDown3D from "./PanDown3D";
import PanUp3D from "./PanUp3D";

const Navigation3D: React.FC = () => {
  return (
    <>
      <PanLeft3D />
      <PanRight3D />
      <PanDown3D />
      <PanUp3D />
    </>
  );
};

export default Navigation3D;
