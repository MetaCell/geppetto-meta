import React from "react";
import Toolbar3DButton from "../Toolbar3DButton";

const PanLeft3D: React.FC = () => {
  return (
    <Toolbar3DButton
      icon={<i className="fas fa-arrow-left" />}
      tooltip="Pan Left"
      onClick={() => console.log("Pan left clicked")}
    />
  );
};

export default PanLeft3D;
