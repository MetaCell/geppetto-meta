import React from "react";
import { Box, SxProps, Theme, Divider } from "@mui/material";
import { useFiber } from "@metacell/geppetto-meta-ui/3d-canvas/Canvas3D";
import { RootState } from "@react-three/fiber";

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
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (fiber: RootState) => void;
  style?: React.CSSProperties;
}) => {
  const canvasId = useCanvasId();
  const fiber = useFiber(canvasId ?? "default");

  return (
    <div
      style={{ ...toolbarButtonBaseStyles, ...style }}
      title={tooltip}
      onClick={() => fiber && onClick(fiber)}
    >
      {icon}
    </div>
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
