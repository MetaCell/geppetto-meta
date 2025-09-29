import React from "react";
import { Toolbar3DButton } from "../toolbar";

const Forward3D: React.FC = () => {
  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-up" />}
      tooltip="Move Forward"
      onClick={() => console.log("Move forward clicked")}
    />
  );
};

export default Forward3D;
