# DicomViewer

A React component for visualising DICOM, NIfTI, and NRRD volumetric data in a quad-viewport layout. Built on [AMI.js](https://github.com/FNNDSC/ami) for medical image processing and [React Three Fiber](https://r3f.docs.pmnd.rs/) (R3F) for rendering — a single WebGL context drives all four viewports simultaneously via scissor testing.

## Overview

Two entry points exist, suited for different use cases:

| Component | Location | Toolbar | When to use |
|---|---|---|---|
| `DicomViewer` | `./DicomViewer` | None — bring your own | Custom UIs, full control |
| `DicomViewer` (preconf) | `./preconf/DicomViewer` | Built-in (view toggle, orientation cycle, threshold) | Quick start, standard toolbar |

Both share the same rendering engine, state model, and extension points.

### Supported formats

Anything AMI.js `VolumeLoader` accepts: multi-file DICOM series, single-file NIfTI (`.nii`, `.nii.gz`), and NRRD. Pass multiple URLs for multi-frame DICOM series.

## Quick start

### Preconfigured viewer (recommended for new projects)

```tsx
import { DicomViewer } from '@metacell/geppetto/dicom-viewer/preconf/DicomViewer';

function App() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <DicomViewer
        id="brain"
        data="/path/to/volume.nii.gz"
        onLoaded={() => console.log('volume ready')}
      />
    </div>
  );
}
```

### Base viewer with a custom toolbar

```tsx
import { DicomViewer } from '@metacell/geppetto/dicom-viewer/DicomViewer';
import { DicomViewerToolbar, DicomViewerButton } from '@metacell/geppetto/dicom-viewer';
import { Toolbar3DSeparator } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

function App() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <DicomViewer
        id="brain"
        data="/path/to/volume.nii.gz"
        overlay={
          <DicomViewerToolbar
            viewerId="brain"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <DicomViewerButton
              icon={<span>⊞</span>}
              tooltip="Toggle quad / single view"
              onClick={ctx =>
                ctx.setViewMode(ctx.viewMode === 'quad_view' ? 'single_view' : 'quad_view')
              }
            />
            <Toolbar3DSeparator />
            <DicomViewerButton
              icon={<span>⇄</span>}
              tooltip="Next orientation"
              onClick={ctx => {
                const next = { '3d': 'coronal', coronal: 'sagittal', sagittal: 'axial', axial: '3d' };
                ctx.setOrientation(next[ctx.orientation]);
              }}
            />
          </DicomViewerToolbar>
        }
      />
    </div>
  );
}
```

## Architecture

### Single WebGL context, four viewports

`DicomCanvas` creates one R3F `<Canvas>` that covers the full container. Four invisible tracking `<div>`s define the viewport regions (top-left = 3D, top-right = axial, bottom-left = sagittal, bottom-right = coronal). Each viewport reads its tracking div's bounds on every frame, sets the WebGL scissor and viewport to those bounds, and calls `gl.render(scene, camera)` imperatively. A `FrameClearer` component clears the full canvas once at priority -1 before any viewport renders, preventing frame bleed.

```
┌─────────────────────────────┐
│  3D (perspective)  │ Axial  │  ← tracking divs drive scissor rect
│────────────────────┼────────│
│  Sagittal          │Coronal │
└─────────────────────────────┘
          ↕ one WebGL canvas (R3F)
```

### State model

Viewer state lives in two layers:

1. **`useDicomViewerStore`** — a global Zustand store keyed by viewer `id`. Holds all domain state (stack, slice indices, view mode, layers, threshold). Multiple viewers on the same page each get their own record.

2. **`DicomViewerContext`** — a React context provided at the `<DicomViewer>` root that exposes the state and actions from the store plus derived helpers (`dataToWorld`, `worldToData`, `syncLocalizers`, `viewportScenes`). Components inside `<DicomViewer>` consume this via `useDicomViewerContext()`.

### Fiber store integration

`DicomCanvas` mounts a `FiberRegister` component inside the R3F `<Canvas>`. This calls `useThree()` and writes the result into `dicom-viewer`'s own `useFiberStore` (from `./canvas-context`) under the viewer's `id`. `DicomViewer` provides `CanvasIdContext` with the viewer `id` so `useDicomFiber(viewerId)` / `<DicomViewerButton>` resolve the current canvas automatically.

This store is **independent** from `3d-canvas`'s `Canvas3D`/`Toolbar3D` versions of the same pattern — the two intentionally don't share state. A DICOM viewport's `controls` are ami.js's `TrackballControl` / `TrackballOrthoControl`, not the `CameraControls` that `Canvas3D`'s pan/zoom/rotate toolbar groups expect, so a shared, single-typed store would either be wrong for one side or require unsafe casts (which is what an earlier version of this file did). Keeping `dicom-viewer` self-contained also means it doesn't require the sibling `3d-canvas` module to exist.

> **If you built a custom toolbar button by importing `useFiber`/`CanvasIdContext` directly from `3d-canvas/toolbar/Toolbar3D` or `3d-canvas/Canvas3D`**, that import no longer resolves DICOM canvases — switch to `useDicomFiber`/`DicomCanvasIdContext` exported from `@metacell/geppetto/dicom-viewer` (see [`DicomViewerButton`](#dicomviewerbutton) below, which already does this for you).

## `DicomViewer` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Unique identifier. Used as the key in `useDicomViewerStore` and `dicom-viewer`'s `useFiberStore`. Two viewers on the same page must have different ids. |
| `data` | `string \| string[]` | **required** | URL(s) to load. Single string for NIfTI/NRRD; array of strings for multi-file DICOM series. |
| `assetLabel` | `string` | `'image'` | Noun used in the built-in loading overlay's copy, e.g. `Loading scan… 42%`. Purely cosmetic. |
| `mode` | `'quad_view' \| 'single_view'` | `'quad_view'` | Initial view layout. |
| `orientation` | `'3d' \| 'axial' \| 'sagittal' \| 'coronal'` | `'3d'` | Active viewport in `single_view`. In `quad_view` this determines which pane is highlighted. |
| `threshold3D` | `number` | `0` | Initial intensity threshold for 3D transparency. Fragments with raw intensity below this value are discarded. `0` = no transparency. Correctly offset for volumes with a negative minimum intensity (e.g. CT in Hounsfield units). |
| `onLoaded` | `() => void` | — | Called once the volume has been loaded and the stack is ready. |
| `onClick` | `ClickAction` | — | Action fired on a plain left-click in any viewport. |
| `onCtrlClick` | `ClickAction` | — | Action fired on Ctrl+click (or ⌘+click on macOS). |
| `onShiftClick` | `ClickAction` | — | Action fired on Shift+click. |
| `onDoubleClick` | `ClickAction` | — | Action fired on double-click. |
| `onRightClick` | `ClickAction` | — | Action fired on right-click (context menu suppressed). |
| `onHover` | `HoverAction` | — | Fired on (rAF-throttled) pointer move over any viewport, and once more with a `null` point on mouse leave. See [`HoverAction` type](#hoveraction-type). |
| `animationSkipRate` | `number` | `1` | Render every Nth frame. Use values > 1 to reduce GPU load for complex scenes. |
| `onRender` | `(viewports: ViewportHandle[]) => void` | — | Called once all four viewports have initialised. Receives an array of `{ id, scene, camera }` handles, indexed by the exported `VP_ID_MAP` (`{ '3d': 0, axial: 1, sagittal: 2, coronal: 3 }`) — e.g. `viewports[VP_ID_MAP.axial]` for the axial pane. |
| `onFps` | `(fps: number) => void` | — | Called approximately every 500 ms with the current frame rate. Resets to 0 after 600 ms of inactivity (demand rendering). |
| `children` | `ReactNode` | — | **R3F scene content** — rendered inside the WebGL Canvas. Use for `<DicomLayer>`, `<DicomOverlay>`, or custom Three.js objects. |
| `overlay` | `ReactNode` | — | **DOM content** — rendered outside the WebGL Canvas in the normal React tree. Use for toolbars, HUDs, legends. |

### `ClickAction` type

```ts
type ClickAction =
  | 'goToPoint'     // navigate all slice planes to the clicked world position
  | 'expandView'    // expand the clicked viewport to single_view (or collapse back)
  | ((
      ctx: DicomViewerContext,
      point: THREE.Vector3,
      event: MouseEvent,
      planeOrientation: PlaneOrientation | '3d', // which viewport the click happened in
    ) => void);
```

Drag is detected with a 4-pixel threshold — dragging suppresses the click event so rotating or panning does not accidentally trigger navigation. A custom (function) action only fires when the click actually hit raycastable geometry — a miss (e.g. clicking empty space around the volume) does not invoke it at all, rather than invoking it with a fabricated origin point.

`'goToPoint'` centers all three 2D planes on the clicked world position using each plane's real ami.js acquisition orientation, so it centers correctly regardless of whether the volume was acquired axially, sagittally, or coronally.

### `HoverAction` type

```ts
type HoverAction = (
  ctx: DicomViewerContext,
  point: THREE.Vector3 | null,
  planeOrientation: PlaneOrientation | '3d',
) => void;
```

Passed as `onHover` on `<DicomViewer>`. Raycasting is throttled to at most one pick per animation frame — pointer-move events between frames are coalesced, always raycasting from the latest event so the reported position doesn't lag behind a fast-moving pointer. `point` is `null` whenever the pointer isn't over any raycastable geometry, and fires once more with `point: null` on `mouseleave` so consumers can reliably clear hover state (e.g. hide a crosshair/tooltip) when the pointer exits a viewport.

## Preconfigured viewer additional props

`preconf/DicomViewer` accepts all base props plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `showToolbar` | `boolean` | `true` | Render the built-in toolbar. Set to `false` to suppress it entirely. |
| `toolbarExtra` | `ReactNode` | — | Additional buttons appended after the last separator in the built-in toolbar. Use `<DicomViewerButton>` / `<Toolbar3DSeparator>` for consistent styling. |
| `extraOverlay` | `ReactNode` | — | Additional DOM elements added to the overlay alongside the built-in toolbar. Use for custom HUD elements, not for R3F scene content. |

Default click behaviour in the preconf viewer: plain click = `'goToPoint'`, Ctrl+click = `'expandView'`.

## Loading state

`<DicomViewer>` shows a built-in overlay (dark scrim, label, progress bar) automatically — no wiring required — and distinguishes two phases that a plain `isLoading` boolean would conflate:

1. **Downloading** — the volume is still being fetched. Label reads `Loading {assetLabel}… N%` when the server reports a `Content-Length` (via ami.js's `fetch-progress` event), or `Loading {assetLabel}…` with an indeterminate animated bar when it doesn't.
2. **Decoding** — the download finished and the stack exists, but nothing has painted yet: `StackHelper`/`DataTexture` construction and the first WebGL frame are still pending. Label reads `Decoding {assetLabel}…`. This phase exists because a `stack` being non-null does *not* mean anything is visible yet — GPU resource construction and the first `gl.render()` call still have to happen.

The overlay clears only once a real frame has actually been drawn for every viewport relevant to the current `mode`/`orientation` (all four in `quad_view`; just the active one in `single_view`) — tracked via each viewport's own render pass, not merely via the presence of `stack`. Switching to `single_view` and back does *not* re-trigger the overlay; only loading a new `data` value does.

Use `assetLabel` to customize the noun in the copy (`assetLabel="scan"` → `Loading scan… 42%`). If you need the raw numbers for a custom loading UI instead of the built-in overlay, call `useVolumeLoader`/`useLayerStack` yourself — see [Advanced: custom volume loading](#advanced-custom-volume-loading).

## Viewer state and context

### `useDicomViewerContext()`

The primary hook for components inside a `<DicomViewer>`. Returns the full `DicomViewerContext`:

```ts
import { useDicomViewerContext } from '@metacell/geppetto/dicom-viewer';

function MyButton() {
  const ctx = useDicomViewerContext();
  // read state, call actions
}
```

Throws if called outside a `<DicomViewer>`.

### State fields

| Field | Type | Description |
|---|---|---|
| `stack` | `StackModel \| null` | The loaded AMI.js base stack. `null` while loading. |
| `viewMode` | `'quad_view' \| 'single_view'` | Current layout. |
| `orientation` | `'3d' \| 'axial' \| 'sagittal' \| 'coronal'` | Active viewport in single view. |
| `sliceIndices` | `Record<PlaneOrientation, number>` | Current slice index for each 2D plane. |
| `sliceMaxIndices` | `Record<PlaneOrientation, number>` | Maximum slice index for each plane (set once the stack helper is ready). |
| `planeStackOrientations` | `Record<PlaneOrientation, number>` | Each plane's real ami.js `camera.stackOrientation` (0/1/2) — which IJK axis that plane's slices step along. Set internally by `Viewport2DContent` once its camera is ready; used by `centerOnPoint` so click-to-center works for any acquisition orientation, not just axial. Not normally read directly. |
| `isLoading` | `boolean` | Volume is currently being fetched/parsed. |
| `layers` | `LayerState[]` | Registered overlay layers (from `<DicomLayer>`). |
| `threshold3D` | `number` | Current 3D transparency threshold value. |
| `threshold3DEnabled` | `boolean` | Whether 3D threshold is applied this frame. Decoupled from the value so toggling does not reset a slider position. |
| `rawData` | `string \| string[] \| null` | The original `data` prop. |
| `viewportScenes` | `Partial<Record<OrientationMode, THREE.Scene>>` | Per-viewport Three.js scenes, populated once each viewport initialises. Read by `<DicomOverlay>` to portal content. |

### Action methods

| Method | Signature | Description |
|---|---|---|
| `setViewMode` | `(mode: ViewMode) => void` | Switch between `'quad_view'` and `'single_view'`. |
| `setOrientation` | `(o: OrientationMode) => void` | Set active viewport (matters in `single_view`). |
| `setSliceIndex` | `(plane: PlaneOrientation, idx: number) => void` | Navigate to a specific slice. Uses a functional Zustand update to avoid races when multiple viewports write concurrently. |
| `setSliceMaxIndex` | `(plane: PlaneOrientation, maxIdx: number) => void` | Update the max-index for one plane (set internally by `Viewport2DContent`). |
| `setPlaneStackOrientation` | `(plane: PlaneOrientation, stackOrientation: number) => void` | Records a plane's real ami.js `camera.stackOrientation`. Set internally by `Viewport2DContent`; not normally called directly. |
| `centerOnPoint` | `(point: THREE.Vector3) => void` | Converts a world (LPS) point to IJK and sets all three plane slice indices to center on it, using each plane's real `planeStackOrientations` mapping. Single source of truth for "center on this point" — used by `'goToPoint'` and safe to call directly for a custom "jump to coordinate" action. |
| `setThreshold3D` | `(value: number) => void` | Update threshold value without toggling it on/off. |
| `setThreshold3DEnabled` | `(enabled: boolean) => void` | Toggle threshold on/off without changing the stored value. |
| `registerLayer` | `(layer: LayerState) => void` | Register a new overlay layer (called by `<DicomLayer>`). |
| `unregisterLayer` | `(id: string) => void` | Remove a layer and free its GPU resources. |
| `setLayerOpacity` | `(id, opacity) => void` | Delegates to the layer's own `setOpacity` closure (which handles background-removal LUT curves if needed). |
| `setLayerTransform` | `(id, transform: LayerTransform) => void` | Apply a rigid translate/rotate/scale to an overlay layer. |
| `setLayerWindowLevel` | `(id, center, width) => void` | Update window/level for a continuous overlay layer. |
| `setLayerLut` | `(id, name: string) => void` | Switch a continuous overlay layer's colour LUT preset at runtime. No-op for segmentation layers (they don't expose `setLut`). |
| `syncLocalizers` | `() => void` | Manually re-synchronise the localizer line equations after a slice change. Called automatically by slice navigation. |

### Coordinate helpers

```ts
// Convert IJK voxel index to LPS world coordinates
const worldPos = ctx.dataToWorld(new THREE.Vector3(i, j, k));

// Convert LPS world coordinates to IJK voxel index
const voxelIdx = ctx.worldToData(new THREE.Vector3(x, y, z));
```

## View modes and orientations

### `quad_view`

All four viewports are visible simultaneously, each occupying one quadrant:

```
┌──────────┬──────────┐
│    3D    │  Axial   │
├──────────┼──────────┤
│ Sagittal │ Coronal  │
└──────────┴──────────┘
```

### `single_view`

Only the viewport matching `orientation` is visible; the others are hidden (zero size). Switching to `single_view` while the `expandView` click action is active simply hides the three other panes without destroying them.

### Localizer lines

When `quad_view` is active, each 2D viewport renders crosshair lines showing where the other two planes intersect the current slice. The lines update automatically on scroll.

| Plane | Line colour |
|---|---|
| Axial | Red `#ff1744` |
| Sagittal | Yellow `#ffea00` |
| Coronal | Green `#76ff03` |

## Slice navigation

### Mouse wheel

Scroll on any 2D viewport to advance or retreat one slice. The scroll handler is attached to the tracking div, not the canvas, so it does not conflict with 3D pan/zoom.

### Programmatic

```ts
ctx.setSliceIndex('axial', ctx.sliceIndices.axial + 10);
```

Slice indices are clamped to `[0, sliceMaxIndices[plane]]` by the viewport logic.

## Overlay layers — `<DicomLayer>`

`DicomLayer` is a declarative component that loads a second volume and blends it over the base stack using AMI.js shader uniforms. Place it in the `children` prop of `<DicomViewer>` (inside the R3F Canvas tree).

```tsx
import { DicomLayer } from '@metacell/geppetto/dicom-viewer';

<DicomViewer id="brain" data="/base.nii.gz">
  {/* Continuous activation map with a hot-and-cold LUT */}
  <DicomLayer
    id="activation"
    data="/fmri.nii.gz"
    lut="hot_and_cold"
    opacity={0.7}
    backgroundRemoval
  />
</DicomViewer>
```

### `DicomLayer` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Unique identifier used to find this layer in `ctx.layers`. |
| `data` | `string \| string[]` | **required** | URL(s) of the overlay volume. Accepts the same formats as the base `data` prop. |
| `renderOrder` | `number` | `1` | Draw order relative to other layers. Lower = drawn first. |
| `opacity` | `number` | `1` | Layer opacity (0–1). **Reactive** — changing it after mount calls `ctx.setLayerOpacity` automatically, no need to call the action yourself. |
| `lut` | `string` | `'hot_and_cold'` | LUT name for continuous overlays (any AMI.js `LutHelper` preset — see the exported `LUT_PRESETS` list). Ignored in segmentation mode. **Reactive** — changing it after mount calls `ctx.setLayerLut` automatically. |
| `windowCenter` | `number` | stack default | Window centre for contrast. **Reactive** together with `windowWidth` — changing either after mount calls `ctx.setLayerWindowLevel` automatically (both must be defined). |
| `windowWidth` | `number` | stack default | Window width for contrast. See `windowCenter`. |
| `interpolation` | `0 \| 1` | `1` | `0` = nearest-neighbour (for label maps), `1` = trilinear (default). |
| `segmentation` | `object` | — | Switch to label-map mode. See below. |
| `backgroundRemoval` | `boolean \| { threshold?: number }` | — | Enable air transparency for CT overlays. Voxels below the threshold (default: `0.2` of normalised intensity) are kept transparent using an opacity LUT curve. Setting `opacity` via `setLayerOpacity` rebuilds the curve automatically. |
| `onProgress` | `(progress: DownloadProgress \| null) => void` | — | Reports this layer's own fetch progress — same shape/semantics as `useVolumeLoader`'s `downloadProgress` (see [Loading state](#loading-state)). Fires `null` once loading finishes or errors. |

#### Label-map mode (`segmentation`)

Without `segmentation`, the overlay is treated as a **continuous intensity volume**: each voxel's raw value is mapped through a 1-D colour LUT (e.g. `hot_and_cold`) using window/level to produce a colour.

When `segmentation` is provided, the layer switches to **label-map mode**: each voxel contains an **integer label index** (e.g. a brain atlas region ID), and each label is mapped to a distinct RGBA colour. The object is passed directly to AMI.js's `SegmentationLutHelper` as its colour preset — a map from label integer to RGBA:

```ts
const segPreset = {
  0: { r: 0,   g: 0,   b: 0,   a: 0   },  // background — always transparent
  1: { r: 255, g: 0,   b: 0,   a: 255 },  // label 1 — red
  2: { r: 0,   g: 255, b: 0,   a: 255 },  // label 2 — green
  3: { r: 0,   g: 0,   b: 255, a: 255 },  // label 3 — blue
};

<DicomLayer id="atlas" data="/atlas.nii.gz" segmentation={segPreset} interpolation={0} />
```

Two things follow from using `segmentation`:
- **`interpolation` should be `0`** (nearest-neighbour). Trilinear interpolation blends adjacent label integers and produces nonsensical in-between colours at region boundaries.
- **`setWindowLevel` and `setLut` are unavailable** on the layer at runtime — window/level and colour LUT only apply to continuous overlays.

### Layer runtime control

There are two ways to adjust a mounted layer — pick whichever fits how your app manages state:

**1. Declaratively, via `<DicomLayer>`'s own props.** `opacity`, `lut`, `windowCenter`, and `windowWidth` are reactive: changing them (e.g. from a slider bound to component state) re-applies automatically, no manual action call needed.

```tsx
const [opacity, setOpacity] = useState(0.7);

<DicomLayer id="activation" data="/fmri.nii.gz" lut="hot_and_cold" opacity={opacity} />
<input type="range" min={0} max={1} step={0.01} value={opacity}
       onChange={e => setOpacity(Number(e.target.value))} />
```

**2. Imperatively, via context actions** — for state that doesn't naturally live as a React prop (e.g. a toolbar button, or code outside the component that rendered the `<DicomLayer>`):

```ts
// Adjust opacity
ctx.setLayerOpacity('activation', 0.5);

// Switch the colour LUT preset
ctx.setLayerLut('activation', 'spectrum');

// Adjust contrast
ctx.setLayerWindowLevel('activation', 400, 800);

// Apply a rigid co-registration nudge (translate in mm, rotate in degrees, scale)
ctx.setLayerTransform('activation', {
  translate: [2, -1, 0],
  rotate: [0, 0, 1.5],
  scale: [1, 1, 1],
});
```

`renderOrder`, `data`, `segmentation`, `interpolation`, and `backgroundRemoval` are creation-time only — changing them after mount has no effect until the layer unmounts and remounts (e.g. via a `key` change), since they determine how the GPU material itself is built.

GPU resources (ShaderMaterial, DataTextures) are created when both the base stack and the overlay stack are ready, and disposed automatically when `<DicomLayer>` unmounts.

## Custom Three.js objects — `<DicomOverlay>`

`DicomOverlay` portals R3F JSX children into one or more viewport scenes using R3F's `createPortal`. This is the correct way to inject custom Three.js objects that should appear in the rendered viewports.

```tsx
import { DicomOverlay } from '@metacell/geppetto/dicom-viewer';

<DicomViewer id="brain" data="/brain.nii.gz">
  <DicomOverlay viewports={['3d', 'axial']}>
    {/* A sphere at LPS world coordinates */}
    <mesh position={[10, -5, 20]}>
      <sphereGeometry args={[2]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </DicomOverlay>
</DicomViewer>
```

### `DicomOverlay` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `coordinateSystem` | `'world' \| 'voxel'` | `'world'` | Coordinate space for child positions. `'world'` = LPS millimetres. `'voxel'` = IJK voxel indices — the `ijk2LPS` matrix is applied automatically as a group transform. |
| `viewports` | `OrientationMode[]` | all four | Restrict the overlay to specific viewports, e.g. `['axial', '3d']`. Exclusion is exact — an overlay restricted to 2D planes (e.g. `['axial']`) will not also appear in the 3D view, even though the 2D scenes are nested inside the 3D scene for slice-plane rendering. |
| `children` | `ReactNode` | **required** | Any R3F-compatible JSX (meshes, lights, helpers, etc.). |

### Voxel-space positioning example

```tsx
<DicomOverlay coordinateSystem="voxel" viewports={['axial']}>
  {/* Placed at IJK voxel (128, 128, 50) — automatically converted to world space */}
  <mesh position={[128, 128, 50]}>
    <sphereGeometry args={[3]} />
    <meshBasicMaterial color="cyan" />
  </mesh>
</DicomOverlay>
```

### Clipping an overlay to the current slice

`viewports` restricts which *panes* an overlay renders into, but a marker list (electrode
contacts, coregistration control points, seed points, …) often also needs to be filtered *within*
a 2D pane so only markers lying on the currently-displayed slice show up. `usePlaneFilters` builds
that filter for you:

```tsx
import * as THREE from 'three';
import { usePlaneFilters, useDicomViewerContext } from '@metacell/geppetto/dicom-viewer';

function SliceClippedMarkers({ points, radius }: { points: THREE.Vector3[]; radius: number }) {
  const ctx = useDicomViewerContext();
  const filters = usePlaneFilters(ctx.stack, ctx.sliceIndices, ctx.planeStackOrientations, radius);

  return (
    <>
      <DicomOverlay viewports={['axial']}>
        {points
          .filter(p => filters.axial?.(p.x, p.y, p.z))
          .map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[radius]} /></mesh>)}
      </DicomOverlay>
      {/* ...repeat for sagittal / coronal with filters.sagittal / filters.coronal */}
    </>
  );
}
```

`usePlaneFilters(stack, sliceIndices, planeStackOrientations, tolerance)` returns one
`PlaneFilter` per anatomical plane — `(lpsX, lpsY, lpsZ) => boolean`, or `null` while `stack` isn't
ready yet. `tolerance` should roughly match the rendered marker's radius so the visual clipping
lines up with the spatial filter. It's built from two lower-level exports if you need more control:

- `soToCol(stackOrientation)` — maps an AMI.js `camera.stackOrientation` (0/1/2) to the `ijk2LPS`
  matrix column index for that plane's normal.
- `makePlaneFilter(stack, sliceIdx, col, tolerance)` — builds a single `PlaneFilter` from a stack,
  a slice index, and a `ijk2LPS` column (as returned by `soToCol`).

## Toolbar system

### `DicomViewerToolbar`

Container for toolbar buttons. Renders a vertical MUI `Box` and provides `DicomViewerIdContext` so child buttons can resolve the viewer.

```tsx
<DicomViewerToolbar viewerId="brain" sx={{ position: 'absolute', top: 8, right: 8 }}>
  {/* buttons */}
</DicomViewerToolbar>
```

| Prop | Type | Description |
|---|---|---|
| `viewerId` | `string` | The `id` of the `<DicomViewer>` this toolbar controls. |
| `sx` | `SxProps<Theme>` | MUI layout overrides. |
| `children` | `ReactNode` | Buttons and separators. |

### `DicomViewerButton`

A toolbar button with access to both the DICOM domain context and the underlying R3F fiber state.

```tsx
<DicomViewerButton
  icon={<i className="fas fa-layer-group" />}
  tooltip="Toggle threshold"
  active={ctx.threshold3DEnabled}
  onClick={(ctx, fiber) => {
    // DICOM domain — toggle transparency on the 3D viewport
    ctx.setThreshold3DEnabled(!ctx.threshold3DEnabled);

    // R3F fiber — request an immediate re-render
    fiber?.invalidate();
  }}
/>
```

| Prop | Type | Description |
|---|---|---|
| `icon` | `ReactNode` | Icon element. |
| `tooltip` | `string` | Native `title` attribute. |
| `onClick` | `(ctx: DicomViewerContext, fiber: CanvasRootState \| null) => void` | Called with both the DICOM context and the R3F root state. `fiber` is `null` only before the canvas mounts. |
| `active` | `boolean` | Highlighted (blue) background when `true`. |
| `disabled` | `boolean` | Dims the button and suppresses click. |
| `style` | `CSSProperties` | Inline style overrides. |

`fiber` is a plain R3F `RootState` (type `CanvasRootState`, importable from `@metacell/geppetto/dicom-viewer`) — it contains `camera`, `scene`, `gl`, `controls`, and `invalidate`. It is *not* the same store as Canvas3D's `Canvas3DRootState`: dicom-viewer keeps its own independent registry (see [Fiber store integration](#fiber-store-integration)) since its `controls` are ami.js's `TrackballControl`/`TrackballOrthoControl`, not the `CameraControls` that Canvas3D's toolbar groups expect. DICOM buttons receive it in addition to `ctx` so they can directly interact with the render engine when needed.

To build a toolbar button from scratch instead of using `<DicomViewerButton>`, use `useDicomCanvasId`/`useDicomFiber`/`DicomCanvasIdContext` — dicom-viewer's own exports of this pattern, aliased on export to avoid a name collision with `3d-canvas`'s identically-shaped `useCanvasId`/`useFiber`/`CanvasIdContext` in `@metacell/geppetto`'s flattened root barrel:

```tsx
import { useDicomCanvasId, useDicomFiber } from '@metacell/geppetto/dicom-viewer';

function MyCustomButton() {
  const canvasId = useDicomCanvasId();
  const fiber = useDicomFiber(canvasId ?? '');
  // ...
}
```

### `Toolbar3DSeparator`

The separator is shared with the Canvas3D toolbar — import it directly from there:

```tsx
import { Toolbar3DSeparator } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

<Toolbar3DSeparator />                    // horizontal (default)
<Toolbar3DSeparator variant="vertical" /> // vertical
```

### Writing a custom toolbar button with context only

If you only need DICOM domain state (the common case), the `fiber` argument can be ignored:

```tsx
<DicomViewerButton
  icon={<i className="fas fa-arrows-alt" />}
  tooltip="Go to centre"
  onClick={ctx => {
    const mid = ctx.sliceMaxIndices;
    ctx.setSliceIndex('axial',    Math.floor(mid.axial    / 2));
    ctx.setSliceIndex('sagittal', Math.floor(mid.sagittal / 2));
    ctx.setSliceIndex('coronal',  Math.floor(mid.coronal  / 2));
  }}
/>
```

## Advanced: reading viewer state outside the component tree

### `useDicomViewer(id)`

React hook that subscribes to a viewer's Zustand record by id. Works anywhere — no need to be inside `<DicomViewer>`:

```ts
import { useDicomViewer } from '@metacell/geppetto/dicom-viewer';

function SliceCounter({ viewerId }: { viewerId: string }) {
  const viewer = useDicomViewer(viewerId);
  if (!viewer) return null;
  return <span>Axial slice: {viewer.sliceIndices.axial}</span>;
}
```

Returns `null` when the viewer is not yet registered (before the `<DicomViewer>` mounts).

### `useDicomViewerStore`

Raw Zustand store for imperative use outside React:

```ts
import { useDicomViewerStore } from '@metacell/geppetto/dicom-viewer';

// Snapshot read
const state = useDicomViewerStore.getState().viewers['brain'];

// Imperative subscribe
const unsub = useDicomViewerStore.subscribe((state, prev) => {
  if (state.viewers['brain'] !== prev.viewers['brain']) {
    console.log('brain viewer changed');
  }
});
```

## Advanced: custom volume loading

### `useVolumeLoader`

Used internally by `<DicomViewer>` to load the base stack. Exported for cases where you need to load a volume outside the component before passing it:

```ts
import { useVolumeLoader } from '@metacell/geppetto/dicom-viewer';

const { stack, loading, error, downloadProgress } = useVolumeLoader('/brain.nii.gz');
```

- Calls `stack.prepare()` and `loader.free()` after loading to release raw frame buffers.
- Returns `null` for `stack` while loading or on error.
- Re-triggers when the URL changes.
- Second argument is an optional `UseVolumeLoaderOptions` (also exported): `{ retainRawData?: boolean }`. When `true`, skips `loader.free()` and calls `stack.pack()` after `prepare()` instead — needed by overlay layers (see `useLayerStack`, which is exactly `useVolumeLoader(data, { retainRawData: true })`) whose raw buffers must survive for texture building. Leave it `false` (the default) for the base volume.
- `downloadProgress` is a live `DownloadProgress | null` (`{ loaded: number; total: number }`, `total: 0` means the server didn't report a `Content-Length`), updated from ami.js's `VolumeLoader`'s `fetch-progress` event during the fetch and cleared once loading finishes or errors. Use the exported `pctOf(downloadProgress)` helper to turn it into a `0–100` percentage, or `null` while size is unknown:

  ```ts
  import { pctOf } from '@metacell/geppetto/dicom-viewer';

  const pct = pctOf(downloadProgress); // number | null
  ```

### `useLayerStack`

Like `useVolumeLoader` but keeps `_rawData` intact (no `loader.free()`) because `createLayerMaterial` needs the raw buffer to build GPU `DataTexture`s. Used internally by `<DicomLayer>`. Also exposes `downloadProgress`, with the same shape and semantics as `useVolumeLoader`.

### `createLayerMaterial`

Low-level factory that takes a loaded AMI.js `StackModel` and a set of options and returns the GPU `ShaderMaterial`, `uniforms`, LUT helpers, and action closures that make up a `LayerState`. Only needed if you are building a fully custom layer system:

```ts
import { createLayerMaterial } from '@metacell/geppetto/dicom-viewer';

const layerState = createLayerMaterial(stack, {
  opacity: 0.8,
  lut: 'rainbow',
  backgroundRemoval: true,
});
// layerState: { material, uniforms, lut, baseLps2IJK, setOpacity, setWindowLevel, setLut, setTransform }
```

`LUT_PRESETS` (also exported) spells out the valid `lut` names — the keys of AMI.js's `LutHelper.presetLuts()` — so a LUT picker can be built without reaching into AMI.js directly: `'default' | 'spectrum' | 'hot_and_cold' | 'gold' | 'red' | 'green' | 'blue' | 'walking_dead' | 'random' | 'muscle_bone'`.

## Performance notes

- **Demand rendering** — `frameloop="demand"` is set on the R3F Canvas. Frames are only rendered when state changes. The `StoreInvalidator` component (inside the Canvas) subscribes to `useDicomViewerStore` and calls `invalidate()` whenever this viewer's record changes, so toolbar actions and slice navigation trigger rendering automatically.

- **`animationSkipRate`** — set to `2` or `3` to render every 2nd or 3rd frame when the scene is very complex. This reduces GPU load at the cost of slightly less responsive interaction.

- **Scissor rendering** — the single WebGL context renders all four viewports in one pass per frame. There is no per-viewport clear; `FrameClearer` clears the full canvas once at the start of each frame.

- **Layer disposal** — `DicomLayer` disposes its `ShaderMaterial` and all `DataTexture`s on unmount. If the WebGL context has already been destroyed at that point (e.g. the parent component unmounts), disposal errors are silently swallowed. Mid-session LUT textures are also disposed correctly: AMI.js's `LutHelper.texture` getter allocates a brand-new `THREE.Texture` on every access rather than caching one, so every opacity/LUT change (`setLayerOpacity`, `setLayerLut`, `backgroundRemoval`'s opacity-driven curve rebuilds) disposes the texture it replaces instead of leaking it.

## Types reference

```ts
type ViewMode = 'single_view' | 'quad_view';
type OrientationMode = '3d' | 'axial' | 'sagittal' | 'coronal';
type PlaneOrientation = 'axial' | 'sagittal' | 'coronal'; // 2D planes only

interface LayerTransform {
  translate?: [number, number, number]; // mm
  rotate?:    [number, number, number]; // degrees (x, y, z Euler)
  scale?:     [number, number, number];
}

interface LayerState {
  id: string;
  material: THREE.ShaderMaterial;
  uniforms: Record<string, { value: any }>;
  renderOrder: number;
  setOpacity: (v: number) => void;
  setWindowLevel?: (center: number, width: number) => void;
  setLut?: (name: string) => void;
  setTransform: (t: LayerTransform) => void;
  lut?: any;    // LutHelper (continuous overlays)
  segLut?: any; // SegmentationLutHelper (label maps)
  baseLps2IJK: THREE.Matrix4;
}

interface ViewportHandle {
  id: number;
  scene: THREE.Scene;
  camera: THREE.Camera;
}

type ClickAction =
  | 'goToPoint'
  | 'expandView'
  | ((
      ctx: DicomViewerContext,
      point: THREE.Vector3,
      event: MouseEvent,
      planeOrientation: PlaneOrientation | '3d',
    ) => void);

type HoverAction = (
  ctx: DicomViewerContext,
  point: THREE.Vector3 | null,
  planeOrientation: PlaneOrientation | '3d',
) => void;

interface DownloadProgress {
  loaded: number;
  total: number; // 0 = server did not report a size
}

interface UseVolumeLoaderOptions {
  retainRawData?: boolean;
}

// (lpsX, lpsY, lpsZ) => boolean, or null while the stack isn't ready — see usePlaneFilters
type PlaneFilter = ((lpsX: number, lpsY: number, lpsZ: number) => boolean) | null;

// A plain R3F RootState — dicom-viewer's own type, independent from Canvas3D's Canvas3DRootState
type CanvasRootState = import('@react-three/fiber').RootState;
```

All types are re-exported from the package index and can be imported as:

```ts
import type {
  ViewMode,
  OrientationMode,
  PlaneOrientation,
  LayerTransform,
  LayerState,
  ClickAction,
  HoverAction,
  DownloadProgress,
  UseVolumeLoaderOptions,
  PlaneFilter,
  CanvasRootState,
  DicomViewerContextType, // DicomViewerContext re-exported under this name to avoid collision with the React context object
  ViewportHandle,
} from '@metacell/geppetto/dicom-viewer';
```
