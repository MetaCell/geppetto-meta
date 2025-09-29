import React from "react";
import { Toolbar3DButton } from "../toolbar";

const Zoom3DButtons: React.FC = () => {
  return (
    <>
      <Toolbar3DButton
        icon={<i className="fas fa-magnifying-glass-plus" />}
        tooltip="Zoom In"
        onClick={() => console.log("Zoom in clicked")}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-magnifying-glass-minus" />}
        tooltip="Zoom Out"
        onClick={() => console.log("Zoom out clicked")}
      />
    </>
  );
};

export default Zoom3DButtons;
