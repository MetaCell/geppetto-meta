import React, { useState, useCallback, useMemo } from "react";
import {
  DicomViewerPreconf,
  DicomOverlay,
  DicomViewerButton,
  useDicomViewerContext,
} from "@metacell/geppetto";

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
 * SphereOverlay — scatter N spheres inside the volume bounding box.
 * Must be a child of <DicomOverlay> so it lives inside the R3F Canvas
 * and has access to DicomViewerContext.
 */
interface SphereOverlayProps {
  count: number;
  color: string;
  seed: number;
}

function SphereOverlay({ count, color, seed }: SphereOverlayProps) {
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

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[radius, 10, 10]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
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

const DicomViewerExample: React.FC = () => {
  const [threshold3D, setThreshold3D] = useState(0);
  const [fps, setFps] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showSelected, setShowSelected] = useState(false);

  const fpsColor = fps >= 50 ? "#4caf50" : fps >= 25 ? "#ff9800" : "#f44336";
  const handleFps = useCallback((v: number) => setFps(v), []);

  /*
   * toolbarExtra is rendered inside the preconf toolbar (after the built-in
   * buttons) so it shares the same toolbar context and consistent styling.
   */
  const toolbarExtra = (
    <>
      <DicomViewerButton
        icon={<AllIcon />}
        tooltip="Toggle 40 orange spheres in all viewports"
        onClick={() => setShowAll(v => !v)}
        active={showAll}
      />
      <DicomViewerButton
        icon={<SomeIcon />}
        tooltip="Toggle 20 cyan spheres (axial + 3D only)"
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
        threshold3D={threshold3D}
        onFps={handleFps}
        toolbarExtra={toolbarExtra}
      >
        {/* R3F scene children: DicomOverlay / DicomLayer */}
        {showAll && (
          <DicomOverlay>
            <SphereOverlay count={40} color="orange" seed={1} />
          </DicomOverlay>
        )}
        {showSelected && (
          <DicomOverlay viewports={["axial", "3d"]}>
            <SphereOverlay count={20} color="cyan" seed={2} />
          </DicomOverlay>
        )}
      </DicomViewerPreconf>

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
