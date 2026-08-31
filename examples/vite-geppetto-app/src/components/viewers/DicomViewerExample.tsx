import React, { useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import {
  DicomViewerPreconf,
  DicomOverlay,
  DicomViewerButton,
  useDicomViewerContext,
  usePlaneFilters,
} from "@metacell/geppetto";
import type { HoverAction, PlaneOrientation } from "@metacell/geppetto";

/*
 * Copy (or symlink) the NIfTI file from the sibling example into this app's
 * public/assets/ directory:
 *
 *   cp ../vite-redux-toolkit-react-app/public/assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz \
 *      public/assets/
 *
 * The gzip-fix Vite plugin prevents the browser from transparently
 * decompressing the file before AMI.js reads it.
 */
const DATA = "/assets/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz";

/*
 * Minimal seeded PRNG — deterministic sphere positions across renders.
 */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/*
 * PlaneClippedSphereOverlay — scatter N spheres inside the volume bounding box.
 * The 3D viewport gets the full, unfiltered scatter (there's no single "current
 * slice" concept in 3D). Each 2D plane listed in `planes` instead only shows the
 * spheres lying within `usePlaneFilters`' tolerance of that plane's *current*
 * slice — demonstrating the same pattern a real electrode/control-point overlay
 * would use to avoid showing markers that aren't actually on the visible slice.
 * Must be a child of <DicomViewerPreconf> so it lives inside the R3F Canvas and
 * has access to DicomViewerContext.
 */
interface PlaneClippedSphereOverlayProps {
  count: number;
  color: string;
  seed: number;
  planes: PlaneOrientation[];
}

function PlaneClippedSphereOverlay({ count, color, seed, planes }: PlaneClippedSphereOverlayProps) {
  const ctx = useDicomViewerContext();

  const { positions, radius } = useMemo(() => {
    if (!ctx.stack) return { positions: [] as [number, number, number][], radius: 5 };
    const bb = ctx.stack.worldBoundingBox(); // [xmin,xmax,ymin,ymax,zmin,zmax]
    const rng = seededRng(seed);
    const pts: [number, number, number][] = Array.from({ length: count }, () => [
      bb[0] + rng() * (bb[1] - bb[0]),
      bb[2] + rng() * (bb[3] - bb[2]),
      bb[4] + rng() * (bb[5] - bb[4]),
    ]);
    const r = Math.max(bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]) * 0.015;
    return { positions: pts, radius: r };
  }, [ctx.stack, count, seed]);

  // Tolerance a bit larger than the sphere radius so a sphere doesn't need to
  // sit exactly on the slice plane to still be considered "on" it.
  const filters = usePlaneFilters(ctx.stack, ctx.sliceIndices, ctx.planeStackOrientations, radius * 1.5);

  const sphere = (pos: [number, number, number], i: number) => (
    <mesh key={i} position={pos}>
      <sphereGeometry args={[radius, 10, 10]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );

  return (
    <>
      <DicomOverlay viewports={["3d"]}>{positions.map(sphere)}</DicomOverlay>
      {planes.map(plane => {
        const filter = filters[plane];
        const clipped = filter ? positions.filter(([x, y, z]) => filter(x, y, z)) : [];
        return (
          <DicomOverlay key={plane} viewports={[plane]}>
            {clipped.map(sphere)}
          </DicomOverlay>
        );
      })}
    </>
  );
}

/* HUD helpers */
const hudBase: React.CSSProperties = {
  position: "absolute",
  zIndex: 10,
  background: "rgba(0,0,0,0.55)",
  borderRadius: 6,
  padding: "6px 10px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#eee",
  fontSize: 12,
  userSelect: "none",
  pointerEvents: "auto",
};

/* Small inline icons for toolbar extras — no fontawesome required */
const AllIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>⬤⬤</span>;
const SomeIcon = () => (
  <span style={{ fontSize: "0.7em", fontWeight: 700, color: "cyan" }}>⬤</span>
);

interface HoverInfo {
  plane: string;
  lps: THREE.Vector3;
  ijk: THREE.Vector3;
}

const DicomViewerExample: React.FC = () => {
  const [threshold3D, setThreshold3D] = useState(0);
  const [fps, setFps] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const fpsColor = fps >= 50 ? "#4caf50" : fps >= 25 ? "#ff9800" : "#f44336";
  const handleFps = useCallback((v: number) => setFps(v), []);

  const handleHover = useCallback<HoverAction>((ctx, point, planeOrientation) => {
    if (!point) {
      setHover(null);
      return;
    }
    setHover({ plane: planeOrientation, lps: point, ijk: ctx.worldToData(point) });
  }, []);

  /*
   * toolbarExtra is rendered inside the preconf toolbar (after the built-in
   * buttons) so it shares the same toolbar context and consistent styling.
   */
  const toolbarExtra = (
    <>
      <DicomViewerButton
        icon={<AllIcon />}
        tooltip="Toggle 40 orange spheres, clipped to the current slice in axial/sagittal/coronal"
        onClick={() => setShowAll(v => !v)}
        active={showAll}
      />
      <DicomViewerButton
        icon={<SomeIcon />}
        tooltip="Toggle 20 cyan spheres (3D + axial, clipped to the current axial slice)"
        onClick={() => setShowSelected(v => !v)}
        active={showSelected}
      />
    </>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DicomViewerPreconf
        id="dicom-viewer"
        data={DATA}
        mode="quad_view"
        orientation="3d"
        onClick="goToPoint"
        onCtrlClick="expandView"
        onHover={handleHover}
        threshold3D={threshold3D}
        onFps={handleFps}
        toolbarExtra={toolbarExtra}
      >
        {/* R3F scene children: DicomOverlay / DicomLayer */}
        {showAll && (
          <PlaneClippedSphereOverlay
            count={40}
            color="orange"
            seed={1}
            planes={["axial", "sagittal", "coronal"]}
          />
        )}
        {showSelected && (
          <PlaneClippedSphereOverlay count={20} color="cyan" seed={2} planes={["axial"]} />
        )}
      </DicomViewerPreconf>

      {/* Hover readout HUD — plane + LPS (world mm) + IJK (voxel) coordinates */}
      {hover && (
        <div style={{ ...hudBase, top: 12, right: 12 }}>
          <span style={{ fontWeight: 700, textTransform: "uppercase" }}>{hover.plane}</span>
          <span>
            LPS {hover.lps.x.toFixed(1)}, {hover.lps.y.toFixed(1)}, {hover.lps.z.toFixed(1)}
          </span>
          <span>
            IJK {Math.round(hover.ijk.x)}, {Math.round(hover.ijk.y)}, {Math.round(hover.ijk.z)}
          </span>
        </div>
      )}

      {/* FPS counter HUD */}
      <div style={{ ...hudBase, top: 12, left: 12 }}>
        <span style={{ color: fpsColor, fontWeight: 700, minWidth: 38 }}>{fps} fps</span>
      </div>

      {/* 3D threshold slider HUD */}
      <div style={{ ...hudBase, bottom: 12, left: 12 }}>
        <span>3D threshold</span>
        <input
          type="range"
          min={0}
          max={500}
          step={1}
          value={threshold3D}
          onChange={e => setThreshold3D(Number(e.target.value))}
          style={{ width: 120, accentColor: "#1976d2" }}
        />
        <span style={{ minWidth: 30, textAlign: "right" }}>{threshold3D}</span>
      </div>
    </div>
  );
};

export default DicomViewerExample;
