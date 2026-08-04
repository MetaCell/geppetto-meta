import React, { useEffect, useMemo } from "react";
import { createPortal, useThree } from "@react-three/fiber";
import { useDicomViewerContext } from "../DicomViewerContext";
import { OrientationMode } from "../types";

const ALL_VIEWPORTS: OrientationMode[] = ["3d", "axial", "sagittal", "coronal"];

interface DicomOverlayProps {
  /*
   * 'world' (default): children are placed in LPS/world space.
   * 'voxel': children are placed in IJK voxel space — the ijk2LPS matrix is
   *          applied automatically so positional props use voxel indices.
   */
  coordinateSystem?: "world" | "voxel";
  // Restrict rendering to a subset of viewports (default: all 4)
  viewports?: OrientationMode[];
  children: React.ReactNode;
}

/*
 * Renders children into one or more viewport scenes via R3F createPortal.
 * By default the overlay appears in all four viewports.  Pass `viewports` to
 * restrict to a specific set, e.g. `viewports={['axial', '3d']}`.
 *
 * With coordinateSystem="voxel" children are wrapped in a group whose matrix
 * is the stack's ijk2LPS transform, so positions expressed in IJK indices are
 * automatically converted to world space.
 */
export const DicomOverlay: React.FC<DicomOverlayProps> = ({
  coordinateSystem = "world",
  viewports = ALL_VIEWPORTS,
  children,
}) => {
  const ctx = useDicomViewerContext();
  const { invalidate } = useThree();

  /*
   * Trigger a render when this overlay mounts or unmounts so the scene reflects
   * the change immediately.  Consumers do not need to call invalidate() themselves.
   */
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
    /*
     * Tagged so Viewport3DContent can find and hide these portal roots for its
     * render pass — the 2D scenes are nested into the 3D scene for slice-plane
     * rendering, which would otherwise also drag in overlays whose `viewports`
     * prop excludes "3d".
     */
    return <group userData={{ isDicomOverlayPortal: true }}>{inner}</group>;
  }, [coordinateSystem, children, ctx.stack]);

  return (
    <>
      {viewports.map(vp => {
        const scene = ctx.viewportScenes[vp];
        if (!scene) return null;
        return createPortal(content, scene, { key: vp } as any);
      })}
    </>
  );
};
