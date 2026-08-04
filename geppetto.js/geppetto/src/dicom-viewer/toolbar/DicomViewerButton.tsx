import React from "react";
import { useDicomViewerContext } from "../DicomViewerContext";
import { DicomViewerContext } from "../types";
import { useCanvasId, useFiber, CanvasRootState } from "../canvas-context";

const buttonBase: React.CSSProperties = {
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

const buttonActive: React.CSSProperties = {
  ...buttonBase,
  color: "#1976d2",
  backgroundColor: "#e3f2fd",
};

interface DicomViewerButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  /*
   * Receives both the DICOM domain context and the underlying R3F fiber state.
   * `fiber` is null only if the canvas has not mounted yet — guard before use.
   */
  onClick: (ctx: DicomViewerContext, fiber: CanvasRootState | null) => void;
  active?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/*
 * A toolbar button with access to both the DicomViewer domain context and the
 * underlying R3F canvas state.  Must be rendered inside a <DicomViewer> so both
 * DicomViewerContext and CanvasIdContext are available.
 */
export const DicomViewerButton: React.FC<DicomViewerButtonProps> = ({
  icon,
  tooltip,
  onClick,
  active = false,
  style,
  disabled = false,
}) => {
  const ctx = useDicomViewerContext();
  const canvasId = useCanvasId();
  const fiber = useFiber(canvasId ?? "");

  const buttonStyle = active ? buttonActive : buttonBase;

  return (
    <button
      style={{
        ...buttonStyle,
        ...style,
        ...(disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}),
      }}
      title={tooltip}
      disabled={disabled}
      onClick={() => !disabled && onClick(ctx, fiber)}
    >
      {icon}
    </button>
  );
};
