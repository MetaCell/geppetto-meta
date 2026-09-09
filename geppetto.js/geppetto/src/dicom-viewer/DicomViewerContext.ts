import React, { useContext } from "react";
import { DicomViewerContext as DicomViewerContextType } from "./types";

export const DicomViewerContext = React.createContext<DicomViewerContextType | null>(null);

export const useDicomViewerContext = (): DicomViewerContextType => {
  const ctx = useContext(DicomViewerContext);
  if (!ctx) throw new Error("useDicomViewerContext must be used inside a <DicomViewer>");
  return ctx;
};
