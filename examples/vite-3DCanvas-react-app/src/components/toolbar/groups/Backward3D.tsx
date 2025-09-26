import React from "react";
import { Toolbar3DButton } from "../Toolbar3D";

const Backward3D: React.FC = () => {
  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-down" />}
      tooltip="Move Backward"
      onClick={() => console.log("Move backward clicked")}
    />
  );
};

export default Backward3D;
