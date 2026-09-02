import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  DicomViewerPreconf,
  DicomOverlay,
  DicomLayer,
  DicomViewerButton,
  useDicomViewerContext,
  usePlaneFilters,
  LUT_PRESETS,
  pctOf,
} from "@metacell/geppetto";
import type {
  HoverAction,
  DicomViewerContextType,
  PlaneOrientation,
  DownloadProgress,
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

/*
 * LayerNudgeController — imperative co-registration nudge for a <DicomLayer>.
 * `setLayerTransform` has no declarative prop equivalent on <DicomLayer> (only
 * opacity/lut/windowCenter/windowWidth are reactive props), so this renders as
 * a logic-only Canvas child — same "return null" pattern as <DicomLayer> itself
 * — that re-applies the transform via context whenever `translateX` changes.
 */
function LayerNudgeController({ layerId, translateX }: { layerId: string; translateX: number }) {
  const ctx = useDicomViewerContext();
  useEffect(() => {
    ctx.setLayerTransform(layerId, { translate: [translateX, 0, 0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerId, translateX]);
  return null;
}

/*
 * StackWindowDefaultsReporter — reads the base stack's own default window
 * center/width once (via ctx.stack, only available inside the Canvas tree)
 * and reports it up so the parent can seed the overlay layer's window/level
 * sliders with sensible bounds instead of guessing fixed numbers.
 */
function StackWindowDefaultsReporter({
  onReady,
}: {
  onReady: (defaults: { center: number; width: number }) => void;
}) {
  const ctx = useDicomViewerContext();
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current || !ctx.stack) return;
    reportedRef.current = true;
    onReady({ center: ctx.stack.windowCenter, width: ctx.stack.windowWidth });
  }, [ctx.stack, onReady]);
  return null;
}

/*
 * PinMarker — single movable marker placed via a custom onClick handler (see
 * `handlePinClick`), demonstrating that `onClick` accepts an arbitrary
 * function alongside the built-in "goToPoint"/"expandView" presets. Reuses
 * `usePlaneFilters` for the same slice-clipping technique as
 * PlaneClippedSphereOverlay: always visible in 3D, only visible in a 2D pane
 * once that pane's current slice is near the pin.
 */
function PinMarker({ point }: { point: THREE.Vector3 }) {
  const ctx = useDicomViewerContext();

  const radius = useMemo(() => {
    if (!ctx.stack) return 4;
    const bb = ctx.stack.worldBoundingBox();
    return Math.max(bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]) * 0.02;
  }, [ctx.stack]);

  const filters = usePlaneFilters(ctx.stack, ctx.sliceIndices, ctx.planeStackOrientations, radius * 2);

  const renderPin = () => (
    <mesh position={[point.x, point.y, point.z]}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial color="magenta" />
    </mesh>
  );

  return (
    <>
      <DicomOverlay viewports={["3d"]}>{renderPin()}</DicomOverlay>
      {(["axial", "sagittal", "coronal"] as const).map(plane => {
        const filter = filters[plane];
        const visible = !!filter && filter(point.x, point.y, point.z);
        return visible ? <DicomOverlay key={plane} viewports={[plane]}>{renderPin()}</DicomOverlay> : null;
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
const LayerIcon = () => <span style={{ fontSize: "0.9em", fontWeight: 700 }}>◱</span>;
const PinIcon = () => (
  <span style={{ fontSize: "0.9em", fontWeight: 700, color: "magenta" }}>◎</span>
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

  /*
   * DicomLayer demo — overlays the same volume on top of itself with a false-
   * colour LUT, air removed, and a co-registration nudge. There's no second
   * dataset shipped with this example, so self-overlay is used purely to
   * exercise the <DicomLayer> mechanics (declarative opacity/lut/windowCenter/
   * windowWidth props, backgroundRemoval, and the imperative setLayerTransform
   * action) without implying any clinical meaning.
   */
  const [showLayer, setShowLayer] = useState(false);
  const [layerOpacity, setLayerOpacity] = useState(0.6);
  const [layerLutIndex, setLayerLutIndex] = useState(1); // "spectrum"
  const [layerNudge, setLayerNudge] = useState(15);
  const [layerProgress, setLayerProgress] = useState<DownloadProgress | null>(null);
  const [layerLoading, setLayerLoading] = useState(false);
  const layerLut = LUT_PRESETS[layerLutIndex];
  const layerPct = pctOf(layerProgress);

  /*
   * Window/level (contrast) sliders for the overlay layer — the last of
   * DicomLayer's reactive props (opacity/lut/transform are already covered)
   * left undemonstrated. Bounds are seeded from the base stack's own default
   * windowCenter/windowWidth via StackWindowDefaultsReporter rather than
   * guessed, since the right range depends entirely on this volume's data.
   */
  const [wlRange, setWlRange] = useState<{ centerMin: number; centerMax: number; widthMax: number } | null>(
    null,
  );
  const [layerWindowCenter, setLayerWindowCenter] = useState<number | null>(null);
  const [layerWindowWidth, setLayerWindowWidth] = useState<number | null>(null);
  const handleStackWindowDefaults = useCallback(({ center, width }: { center: number; width: number }) => {
    setWlRange({ centerMin: center - width, centerMax: center + width, widthMax: width * 2 });
    setLayerWindowCenter(center);
    setLayerWindowWidth(width);
  }, []);

  /*
   * Pin-drop mode — a custom onClick function (as opposed to the built-in
   * "goToPoint"/"expandView" presets) that places or moves a single magenta
   * marker at the clicked point. Gated behind a toolbar toggle so it doesn't
   * clash with the default click-to-navigate behaviour.
   */
  const [pinMode, setPinMode] = useState(false);
  const [pinPoint, setPinPoint] = useState<THREE.Vector3 | null>(null);
  const handlePinClick = useCallback((_ctx: DicomViewerContextType, point: THREE.Vector3) => {
    setPinPoint(point.clone());
  }, []);

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
      <DicomViewerButton
        icon={<LayerIcon />}
        tooltip="Toggle a self-overlay <DicomLayer> (false-colour LUT, air removed, co-registration nudge)"
        onClick={() =>
          setShowLayer(v => {
            if (v) {
              // Turning off: reset so a later toggle-on doesn't briefly show stale loading state
              setLayerLoading(false);
              setLayerProgress(null);
            }
            return !v;
          })
        }
        active={showLayer}
      />
      <DicomViewerButton
        icon={<PinIcon />}
        tooltip="Pin-drop mode: click a viewport to place/move a magenta marker (click navigation is disabled while active)"
        onClick={() => setPinMode(v => !v)}
        active={pinMode}
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
        onClick={pinMode ? handlePinClick : "goToPoint"}
        onCtrlClick="expandView"
        onHover={handleHover}
        threshold3D={threshold3D}
        onFps={handleFps}
        toolbarExtra={toolbarExtra}
      >
        {/* R3F scene children: DicomOverlay / DicomLayer */}
        <StackWindowDefaultsReporter onReady={handleStackWindowDefaults} />
        {pinPoint && <PinMarker point={pinPoint} />}
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
        {showLayer && (
          <>
            <DicomLayer
              id="overlay-self"
              data={DATA}
              lut={layerLut}
              opacity={layerOpacity}
              windowCenter={layerWindowCenter ?? undefined}
              windowWidth={layerWindowWidth ?? undefined}
              backgroundRemoval
              onLoadingChange={setLayerLoading}
              onProgress={setLayerProgress}
            />
            <LayerNudgeController layerId="overlay-self" translateX={layerNudge} />
          </>
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

      {/* DicomLayer overlay controls HUD */}
      {showLayer && (
        <div style={{ ...hudBase, bottom: 12, right: 12, flexDirection: "column", alignItems: "stretch" }}>
          <style>{`@keyframes overlay-layer-indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
          <span style={{ fontWeight: 700 }}>Overlay layer</span>
          {layerLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>{layerPct !== null ? `loading… ${layerPct}%` : "loading…"}</span>
              <div
                style={{
                  width: 80,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    width: layerPct !== null ? `${layerPct}%` : "35%",
                    transition: layerPct !== null ? "width 0.2s ease" : "none",
                    animation:
                      layerPct === null ? "overlay-layer-indeterminate 1.2s linear infinite" : "none",
                  }}
                />
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              opacity: layerLoading ? 0.4 : 1,
              pointerEvents: layerLoading ? "none" : "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ minWidth: 42 }}>opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={layerOpacity}
                onChange={e => setLayerOpacity(Number(e.target.value))}
                style={{ width: 110, accentColor: "#1976d2" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ minWidth: 42 }}>nudge</span>
              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={layerNudge}
                onChange={e => setLayerNudge(Number(e.target.value))}
                style={{ width: 110, accentColor: "#1976d2" }}
              />
              <span style={{ minWidth: 32, textAlign: "right" }}>{layerNudge}mm</span>
            </div>
            {wlRange && layerWindowCenter !== null && layerWindowWidth !== null && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ minWidth: 42 }}>level</span>
                  <input
                    type="range"
                    min={wlRange.centerMin}
                    max={wlRange.centerMax}
                    step={1}
                    value={layerWindowCenter}
                    onChange={e => setLayerWindowCenter(Number(e.target.value))}
                    style={{ width: 110, accentColor: "#1976d2" }}
                  />
                  <span style={{ minWidth: 32, textAlign: "right" }}>{Math.round(layerWindowCenter)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ minWidth: 42 }}>window</span>
                  <input
                    type="range"
                    min={1}
                    max={wlRange.widthMax}
                    step={1}
                    value={layerWindowWidth}
                    onChange={e => setLayerWindowWidth(Number(e.target.value))}
                    style={{ width: 110, accentColor: "#1976d2" }}
                  />
                  <span style={{ minWidth: 32, textAlign: "right" }}>{Math.round(layerWindowWidth)}</span>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setLayerLutIndex(i => (i + 1) % LUT_PRESETS.length)}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#eee",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 4,
                padding: "3px 6px",
                cursor: "pointer",
              }}
            >
              lut: {layerLut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicomViewerExample;
