import React, { useEffect, useMemo } from "react";
import { createPortal, useThree } from "@react-three/fiber";
import { useDicomViewerContext } from "../DicomViewerContext";
import { OrientationMode } from "../types";

const ALL_VIEWPORTS: OrientationMode[] = ["3d", "axial", "sagittal", "coronal"];

interface DicomOverlayProps {
  coordinateSystem?: "world" | "voxel";
  // Restrict rendering to a subset of viewports (default: all 4)
  viewports?: OrientationMode[];
  children: React.ReactNode;
}

export const DicomOverlay: React.FC<DicomOverlayProps> = ({
  coordinateSystem = "world",
  viewports = ALL_VIEWPORTS,
  children,
}) => {
  const ctx = useDicomViewerContext();
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
    return () => invalidate();
  }, []);

  const content = useMemo(() => {
    const inner =
      coordinateSystem === "voxel" && ctx.stack ? (
        // ijk2LPS is the stack's IJK-to-world transform (column-major THREE.Matrix4)
        <group matrix={ctx.stack.ijk2LPS} matrixAutoUpdate={false}>
          {children}
        </group>
      ) : (
        <>{children}</>
      );
    return <group userData={{ isDicomOverlayPortal: true }}>{inner}</group>;
  }, [coordinateSystem, children, ctx.stack]);

  return (
    <>
      {viewports.map(vp => {
        const scene = ctx.viewportScenes[vp];
        if (!scene) return null;
        // createPortal's 3rd param is a RootState override, not a React key —
        // the key has to be set on the returned element itself.
        return React.cloneElement(createPortal(content, scene), { key: vp });
      })}
    </>
  );
};
