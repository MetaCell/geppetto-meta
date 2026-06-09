import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

/*
 * Internal context: passes the viewer id down to DicomViewerButton without
 * requiring every button to receive it as an explicit prop.
 */
const DicomViewerIdContext = React.createContext<string | undefined>(undefined);
export const useDicomViewerId = () => React.useContext(DicomViewerIdContext);

const toolbarBaseStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
};

interface DicomViewerToolbarProps {
  /*
   * The `id` of the <DicomViewer> this toolbar controls — required so
   * DicomViewerButton can look up the right context instance.
   */
  viewerId: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

/*
 * Thin container that establishes the viewer id context for its children.
 * Mirrors the Toolbar3D pattern — no styling opinions beyond defaults.
 */
export const DicomViewerToolbar: React.FC<DicomViewerToolbarProps> = ({
  viewerId,
  children,
  sx,
}) => (
  <DicomViewerIdContext.Provider value={viewerId}>
    <Box sx={{ ...toolbarBaseStyles, ...sx }}>{children}</Box>
  </DicomViewerIdContext.Provider>
);
