import { Box, SxProps, Theme } from "@mui/material";
import React from "react";

const DicomViewerIdContext = React.createContext<string | undefined>(undefined);
export const useDicomViewerId = () => React.useContext(DicomViewerIdContext);

const toolbarBaseStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
};

interface DicomViewerToolbarProps {
  // The `id` of the <DicomViewer> this toolbar controls
  viewerId: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const DicomViewerToolbar: React.FC<DicomViewerToolbarProps> = ({
  viewerId,
  children,
  sx,
}) => (
  <DicomViewerIdContext.Provider value={viewerId}>
    <Box sx={{ ...toolbarBaseStyles, ...sx }}>{children}</Box>
  </DicomViewerIdContext.Provider>
);
