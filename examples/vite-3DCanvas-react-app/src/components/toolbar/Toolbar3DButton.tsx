import { useFiberStore } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { RootState } from "@react-three/fiber";
import React from "react";

const baseStyles: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "1.25rem",
  color: "#666",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const Toolbar3DButton = ({
  icon,
  tooltip,
  onClick,
  style,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (fiber: RootState) => void;
  style?: React.CSSProperties;
}) => {
  const fiber = useFiberStore((s) => s.rootState);
  return (
    <div
      style={{ ...baseStyles, ...style }}
      title={tooltip}
      onClick={() => fiber && onClick(fiber)}
    >
      {icon}
    </div>
  );
};

export default Toolbar3DButton;
