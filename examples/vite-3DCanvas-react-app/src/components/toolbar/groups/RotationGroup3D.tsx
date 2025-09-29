import React from "react";
import { Toolbar3DButton } from "../toolbar";

const Animation3DControls: React.FC = () => {
  return (
    <>
      <Toolbar3DButton
        icon={<i className="fas fa-play" />}
        tooltip="Play Animation"
        onClick={() => console.log("Play animation clicked")}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-pause" />}
        tooltip="Pause Animation"
        onClick={() => console.log("Pause animation clicked")}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-stop" />}
        tooltip="Stop Animation"
        onClick={() => console.log("Stop animation clicked")}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-rotate-left" />}
        tooltip="Rotate Left"
        onClick={() => console.log("Rotate left clicked")}
      />
      <Toolbar3DButton
        icon={<i className="fas fa-rotate-right" />}
        tooltip="Rotate Right"
        onClick={() => console.log("Rotate right clicked")}
      />
    </>
  );
};

export default Animation3DControls;
