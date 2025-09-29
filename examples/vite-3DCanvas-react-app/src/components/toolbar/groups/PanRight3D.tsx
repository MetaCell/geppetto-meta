import React from "react";
import { Toolbar3DButton } from "../toolbar";

const PanRight3D: React.FC = () => {
  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-right" />}
      tooltip="Pan Right"
      onClick={() => console.log("Pan right clicked")}
    />
  );
};

export default PanRight3D;
