import React from "react";
import PanLeft3D from "./PanLeft3D";
import PanRight3D from "./PanRight3D";
import PanDown3D from "./PanDown3D";
import PanUp3D from "./PanUp3D";

interface PanOptions {
  distance?: number;
  useTransition?: boolean;
}

const Navigation3D: React.FC<{ panOptions?: PanOptions }> = ({ panOptions = { distance: 0.5, useTransition: true } }) => {
  return (
    <>
      <PanLeft3D panOptions={panOptions} />
      <PanRight3D panOptions={panOptions} />
      <PanDown3D panOptions={panOptions} />
      <PanUp3D  panOptions={panOptions} />
    </>
  );
};

export default Navigation3D;
