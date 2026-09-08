import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  DicomViewerPreconf,
  DicomOverlay,
  DicomLayer,
  DicomViewerButton,
  useDicomViewerContext,
  useDicomCanvasId,
  useSliceIndices,
  usePlaneFilters,
  LUT_PRESETS,
  pctOf,
  DEFAULT_VIEW_LAYOUTS,
} from "@metacell/geppetto";
import type {
  HoverAction,
  DicomViewerContextType,
  PlaneOrientation,
  DownloadProgress,
  ViewLayouts,
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

// useSliceIndices() reads undefined before the viewer registers; fall back to origin.
const DEFAULT_SLICE_INDICES: Record<PlaneOrientation, number> = { axial: 0, sagittal: 0, coronal: 0 };

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
  // Subscribed directly instead of read from the context: slice position is the highest-frequency
  // write in the viewer, and carrying it on the context value re-rendered every consumer on every
  // scrub tick. This component genuinely needs it — it filters by proximity to the current slice.
  const sliceIndices = useSliceIndices(useDicomCanvasId()) ?? DEFAULT_SLICE_INDICES;

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
  const filters = usePlaneFilters(ctx.stack, sliceIndices, ctx.planeStackOrientations, radius * 1.5);

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
 * PinMarker — single movable marker placed via a custom interactions.onClick handler (see
 * `handlePinClick`), demonstrating that it accepts an arbitrary
 * function alongside the built-in "goToPoint"/"expandView" presets. Reuses
 * `usePlaneFilters` for the same slice-clipping technique as
 * PlaneClippedSphereOverlay: always visible in 3D, only visible in a 2D pane
 * once that pane's current slice is near the pin.
 */
function PinMarker({ point }: { point: THREE.Vector3 }) {
  const ctx = useDicomViewerContext();
  const sliceIndices = useSliceIndices(useDicomCanvasId()) ?? DEFAULT_SLICE_INDICES;

  const radius = useMemo(() => {
    if (!ctx.stack) return 4;
    const bb = ctx.stack.worldBoundingBox();
    return Math.max(bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]) * 0.02;
  }, [ctx.stack]);

  const filters = usePlaneFilters(ctx.stack, sliceIndices, ctx.planeStackOrientations, radius * 2);

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
const RowIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>▤</span>;
const DualRowIcon = () => <span style={{ fontSize: "0.7em", fontWeight: 700 }}>▦</span>;

// Stable references (not fresh array literals per render) — see the layerIds note in the docs.
const DUAL_ROW_LAYER_IDS = ["dual-row-layer"];
const NO_LAYER_IDS: string[] = [];

/*
 * Custom view mode demo #1 — 3D on top (full width), the three 2D planes in a row underneath.
 * Spreads DEFAULT_VIEW_LAYOUTS (so "single_view"/"quad_view" still work) and adds "row_view" as a
 * plain array of PaneDescriptors — the same shape the built-in modes use, proving a consumer can
 * add named layouts without geppetto knowing about them ahead of time.
 *
 * Written out pane-by-pane (not derived from a loop) so each one is easy to read, copy, and tweak
 * independently — that's the point of an example.
 *
 * Reuses the canonical ids ("3d"/"axial"/"sagittal"/"coronal") rather than inventing new ones:
 * kind/planeOrientation are derived from those ids automatically, so this just repositions the
 * same four live panes quad_view/single_view already use — no new panes, no camera/controls
 * recreated. That also means onRender below won't log here: it fires once, ever, per pane id, and
 * quad_view (the default initial mode) already fired it for these same four ids before row_view is
 * ever selected. It's left in to show the shape — it would fire for a mode that introduces a
 * genuinely new pane id instead.
 */
const CUSTOM_VIEW_LAYOUTS: ViewLayouts = {
  ...DEFAULT_VIEW_LAYOUTS,
  row_view: [
    {
      id: "3d",
      style: () => ({ position: "absolute", top: 0, left: 0, width: "100%", height: "50%" }),
      onRender: (_handle, siblings) => {
        console.log('[row_view] pane "3d" rendered; ready so far:', Object.keys(siblings));
      },
    },
    {
      id: "axial",
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "0%",
        width: "33.3333%",
        height: "50%",
      }),
      onRender: (_handle, siblings) => {
        console.log('[row_view] pane "axial" rendered; ready so far:', Object.keys(siblings));
      },
    },
    {
      id: "sagittal",
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "33.3333%",
        width: "33.3333%",
        height: "50%",
      }),
      onRender: (_handle, siblings) => {
        console.log('[row_view] pane "sagittal" rendered; ready so far:', Object.keys(siblings));
      },
    },
    {
      id: "coronal",
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "66.6667%",
        width: "33.3333%",
        height: "50%",
      }),
      onRender: (_handle, siblings) => {
        console.log('[row_view] pane "coronal" rendered; ready so far:', Object.keys(siblings));
      },
    },
  ],
  /*
   * Custom view mode demo #2 — a 2x3 grid modelled on HFO's dual_row_view: a "solo" row on top
   * showing a second load of the same volume as a <DicomLayer> (a different LUT, "hot_and_cold",
   * so it's visually distinct), and the plain canonical row underneath. HFO's real dual_row_view
   * puts a genuinely different modality (CT) in the top row; there's only one dataset shipped with
   * this example, so the same file stands in for it here — the point is the *mechanism*
   * (layerIds routing a specific overlay layer to a specific pane), not the clinical content.
   *
   * Top row panes are new ids (there's no canonical "solo" pane), so kind/planeOrientation must be
   * given explicitly and layerIds restricts each to only the "dual-row-layer" overlay. Bottom row
   * reuses the canonical ids and sets layerIds to an empty array so it stays a plain, unfiltered
   * view regardless of whether the unrelated "overlay-self" layer (toggled separately) is on.
   */
  dual_row_view: [
    {
      id: "dual_row_axial",
      kind: "2d",
      planeOrientation: "axial",
      layerIds: DUAL_ROW_LAYER_IDS,
      style: () => ({ position: "absolute", top: 0, left: "0%", width: "33.3333%", height: "50%" }),
    },
    {
      id: "dual_row_sagittal",
      kind: "2d",
      planeOrientation: "sagittal",
      layerIds: DUAL_ROW_LAYER_IDS,
      style: () => ({
        position: "absolute",
        top: 0,
        left: "33.3333%",
        width: "33.3333%",
        height: "50%",
      }),
    },
    {
      id: "dual_row_coronal",
      kind: "2d",
      planeOrientation: "coronal",
      layerIds: DUAL_ROW_LAYER_IDS,
      style: () => ({
        position: "absolute",
        top: 0,
        left: "66.6667%",
        width: "33.3333%",
        height: "50%",
      }),
    },
    {
      id: "axial",
      layerIds: NO_LAYER_IDS,
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "0%",
        width: "33.3333%",
        height: "50%",
      }),
    },
    {
      id: "sagittal",
      layerIds: NO_LAYER_IDS,
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "33.3333%",
        width: "33.3333%",
        height: "50%",
      }),
    },
    {
      id: "coronal",
      layerIds: NO_LAYER_IDS,
      style: () => ({
        position: "absolute",
        top: "50%",
        left: "66.6667%",
        width: "33.3333%",
        height: "50%",
      }),
    },
  ],
};

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
  const [viewMode, setViewMode] = useState<"quad_view" | "row_view" | "dual_row_view">(
    "quad_view",
  );
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

  // Top-level onRender — fires once per view activation, once every pane of that view has
  // painted. Generalizes the old fixed-4-viewport callback to whichever mode is active.
  const [lastRenderedMode, setLastRenderedMode] = useState<string | null>(null);
  const handleRender = useCallback((viewports: Record<string, unknown>, mode: string) => {
    setLastRenderedMode(mode);
    console.log(`[onRender] "${mode}" fully rendered:`, Object.keys(viewports));
  }, []);

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
      <DicomViewerButton
        icon={<RowIcon />}
        tooltip="Toggle a custom 'row_view' layout (3D on top, the 3 planes in a row below) — demonstrates viewLayouts"
        onClick={() => setViewMode(v => (v === "row_view" ? "quad_view" : "row_view"))}
        active={viewMode === "row_view"}
      />
      <DicomViewerButton
        icon={<DualRowIcon />}
        tooltip="Toggle a custom 'dual_row_view' layout (2×3 grid): top row is the same volume loaded again as a <DicomLayer> with a different LUT, bottom row is the plain view"
        onClick={() => setViewMode(v => (v === "dual_row_view" ? "quad_view" : "dual_row_view"))}
        active={viewMode === "dual_row_view"}
      />
    </>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DicomViewerPreconf
        id="dicom-viewer"
        data={DATA}
        mode={viewMode}
        viewLayouts={CUSTOM_VIEW_LAYOUTS}
        orientation="3d"
        interactions={{
          onClick: pinMode ? handlePinClick : "goToPoint",
          onCtrlClick: "expandView",
          onHover: handleHover,
        }}
        threshold3D={threshold3D}
        onFps={handleFps}
        onRender={handleRender}
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
        {/* dual_row_view's top row routes to this layer via layerIds — see CUSTOM_VIEW_LAYOUTS */}
        {viewMode === "dual_row_view" && (
          <DicomLayer
            id="dual-row-layer"
            data={DATA}
            lut="hot_and_cold"
            opacity={0.85}
            backgroundRemoval
          />
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
        {lastRenderedMode && (
          <span style={{ opacity: 0.7 }}>· rendered: {lastRenderedMode}</span>
        )}
      </div>

      {/* 3D threshold slider HUD */}
      <div style={{ ...hudBase, bottom: 12, left: 12 }}>
        <span>Transparency threshold</span>
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
              title="Cycle the overlay's colour LUT preset"
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
