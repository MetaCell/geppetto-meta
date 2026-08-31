import React from "react";
import { DicomViewer as BaseDicomViewer } from "../DicomViewer";
import { DicomViewerToolbar } from "../toolbar/DicomViewerToolbar";
import { Toolbar3DSeparator } from "../../3d-canvas/toolbar/Toolbar3D";
import { DicomViewerButton } from "../toolbar/DicomViewerButton";
import { useDicomViewerContext } from "../DicomViewerContext";
import { DicomViewerProps, DicomViewerContext, OrientationMode } from "../types";

const NEXT_ORIENTATION: Record<OrientationMode, OrientationMode> = {
  "3d": "coronal",
  coronal: "sagittal",
  sagittal: "axial",
  axial: "3d",
};

const QuadIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>⊞</span>;
const CycleIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>⇄</span>;
// Filled diamond — visually suggests "threshold / cutoff"
const ThreshIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>◈</span>;

function StandardToolbar({ viewerId, extra }: { viewerId: string; extra?: React.ReactNode }) {
  const ctx = useDicomViewerContext();
  return (
    <DicomViewerToolbar
      viewerId={viewerId}
      sx={{ position: "absolute", top: 8, right: 8, zIndex: 5, borderRadius: 1, boxShadow: 1 }}
    >
      <DicomViewerButton
        icon={<QuadIcon />}
        tooltip="Toggle single / quad view"
        onClick={(c: DicomViewerContext) => {
          c.setViewMode(c.viewMode === "quad_view" ? "single_view" : "quad_view");
        }}
        active={false}
      />
      <Toolbar3DSeparator />
      <DicomViewerButton
        icon={<CycleIcon />}
        tooltip="Cycle orientation"
        onClick={(c: DicomViewerContext) => {
          c.setOrientation(NEXT_ORIENTATION[c.orientation]);
        }}
      />
      <Toolbar3DSeparator />
      <DicomViewerButton
        icon={<ThreshIcon />}
        tooltip="Toggle 3D background transparency"
        onClick={(c: DicomViewerContext) => {
          c.setThreshold3DEnabled(!c.threshold3DEnabled);
        }}
        active={ctx.threshold3DEnabled}
      />
      {extra && (
        <>
          <Toolbar3DSeparator />
          {extra}
        </>
      )}
    </DicomViewerToolbar>
  );
}

interface PreconfDicomViewerProps extends DicomViewerProps {
  // Set to false to suppress the built-in toolbar
  showToolbar?: boolean;
  toolbarExtra?: React.ReactNode;
  extraOverlay?: React.ReactNode;
}

export const DicomViewer: React.FC<PreconfDicomViewerProps> = ({
  id,
  showToolbar = true,
  onClick = "goToPoint",
  onCtrlClick = "expandView", // ctrl+click expands the clicked viewport; second click collapses
  toolbarExtra,
  extraOverlay,
  children,
  threshold3D,
  ...rest
}) => {
  return (
    <BaseDicomViewer
      id={id}
      onClick={onClick}
      onCtrlClick={onCtrlClick}
      threshold3D={threshold3D}
      overlay={
        showToolbar || extraOverlay ? (
          <>
            {showToolbar && <StandardToolbar viewerId={id} extra={toolbarExtra} />}
            {extraOverlay}
          </>
        ) : undefined
      }
      {...rest}
    >
      {children}
    </BaseDicomViewer>
  );
};

export default DicomViewer;
