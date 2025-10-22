import React from "react";
import { Box, SxProps, Theme, Divider } from "@mui/material";
import { Canvas3DRootState, useFiber } from "../Canvas3D";

const toolbarBaseStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
};

const toolbarButtonBaseStyles: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "1.25rem",
  color: "#666",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "none",
  backgroundColor: "transparent",
  transition: "all 0.2s ease",
};

const toolbarButtonActiveStyles: React.CSSProperties = {
  ...toolbarButtonBaseStyles,
  color: "#1976d2",
  backgroundColor: "#e3f2fd",
};

const CanvasIdContext = React.createContext<string | undefined>(undefined);
const useCanvasId = () => React.useContext(CanvasIdContext);

export const Toolbar3D = ({
  children,
  sx,
  canvasId,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  canvasId?: string;
}) => {
  return (
    <CanvasIdContext.Provider value={canvasId}>
      <Box sx={{ ...toolbarBaseStyles, ...sx }}>{children}</Box>
    </CanvasIdContext.Provider>
  );
};

export const Toolbar3DButton = ({
  icon,
  tooltip,
  onClick,
  style,
  active = false,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (fiber: Canvas3DRootState) => void;
  style?: React.CSSProperties;
  active?: boolean;
}) => {
  const canvasId = useCanvasId();
  const fiber = useFiber(canvasId ?? "default");

  const buttonStyle = active
    ? toolbarButtonActiveStyles
    : toolbarButtonBaseStyles;

  const handleClick = () => {
    if (fiber) {
      onClick(fiber);
    } else {
      console.log("No fiber found - canvas might not be ready");
    }
  };

  return (
    <button
      style={{ ...buttonStyle, ...style }}
      title={tooltip}
      onClick={handleClick}
    >
      {icon}
    </button>
  );
};

export const Toolbar3DSeparator = ({
  style,
  variant = "horizontal",
}: {
  style?: React.CSSProperties;
  variant?: "horizontal" | "vertical";
}) => {
  return (
    <Divider
      style={{ ...style }}
      orientation={variant === "horizontal" ? "horizontal" : "vertical"}
    />
  );
};
