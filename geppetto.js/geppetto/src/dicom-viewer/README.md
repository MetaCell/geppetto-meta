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

`DicomCanvas` mounts a `FiberRegistrar` component inside the R3F `<Canvas>`. This calls `useThree()` and writes the result into the shared `useFiberStore` (the same store used by `Canvas3D`) under the viewer's `id`. As a result, `useFiber(viewerId)` and `Toolbar3DButton` work for DICOM canvases exactly as they do for `Canvas3D` canvases, and `DicomViewer` provides `CanvasIdContext` with the viewer `id` so the toolbar wiring resolves automatically.

## `DicomViewer` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Unique identifier. Used as the key in `useDicomViewerStore` and `useFiberStore`. Two viewers on the same page must have different ids. |
| `data` | `string \| string[]` | **required** | URL(s) to load. Single string for NIfTI/NRRD; array of strings for multi-file DICOM series. Also accepts a Geppetto `Instance` model object (the NIfTI URL is extracted automatically). |
| `mode` | `'quad_view' \| 'single_view'` | `'quad_view'` | Initial view layout. |
| `orientation` | `'3d' \| 'axial' \| 'sagittal' \| 'coronal'` | `'3d'` | Active viewport in `single_view`. In `quad_view` this determines which pane is highlighted. |
| `threshold3D` | `number` | `0` | Initial intensity threshold for 3D transparency. Fragments with raw intensity below this value are discarded. `0` = no transparency. |
| `onLoaded` | `() => void` | — | Called once the volume has been loaded and the stack is ready. |
| `onClick` | `ClickAction` | — | Action fired on a plain left-click in any viewport. |
| `onCtrlClick` | `ClickAction` | — | Action fired on Ctrl+click (or ⌘+click on macOS). |
| `onShiftClick` | `ClickAction` | — | Action fired on Shift+click. |
| `onDoubleClick` | `ClickAction` | — | Action fired on double-click. |
| `onRightClick` | `ClickAction` | — | Action fired on right-click (context menu suppressed). |
| `animationSkipRate` | `number` | `1` | Render every Nth frame. Use values > 1 to reduce GPU load for complex scenes. |
| `onRender` | `(viewports: ViewportHandle[]) => void` | — | Called once all four viewports have initialised. Receives an array of `{ id, scene, camera }` handles. |
| `onFps` | `(fps: number) => void` | — | Called approximately every 500 ms with the current frame rate. Resets to 0 after 600 ms of inactivity (demand rendering). |
| `children` | `ReactNode` | — | **R3F scene content** — rendered inside the WebGL Canvas. Use for `<DicomLayer>`, `<DicomOverlay>`, or custom Three.js objects. |
| `overlay` | `ReactNode` | — | **DOM content** — rendered outside the WebGL Canvas in the normal React tree. Use for toolbars, HUDs, legends. |

### `ClickAction` type

```ts
type ClickAction =
  | 'goToPoint'     // navigate all slice planes to the clicked world position
  | 'expandView'    // expand the clicked viewport to single_view (or collapse back)
  | ((ctx: DicomViewerContext, point: THREE.Vector3, event: MouseEvent) => void);
```

Drag is detected with a 4-pixel threshold — dragging suppresses the click event so rotating or panning does not accidentally trigger navigation.

## Preconfigured viewer additional props

`preconf/DicomViewer` accepts all base props plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `showToolbar` | `boolean` | `true` | Render the built-in toolbar. Set to `false` to suppress it entirely. |
| `toolbarExtra` | `ReactNode` | — | Additional buttons appended after the last separator in the built-in toolbar. Use `<DicomViewerButton>` / `<Toolbar3DSeparator>` for consistent styling. |
| `extraOverlay` | `ReactNode` | — | Additional DOM elements added to the overlay alongside the built-in toolbar. Use for custom HUD elements, not for R3F scene content. |

Default click behaviour in the preconf viewer: plain click = `'goToPoint'`, Ctrl+click = `'expandView'`.

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
| `setThreshold3D` | `(value: number) => void` | Update threshold value without toggling it on/off. |
| `setThreshold3DEnabled` | `(enabled: boolean) => void` | Toggle threshold on/off without changing the stored value. |
| `registerLayer` | `(layer: LayerState) => void` | Register a new overlay layer (called by `<DicomLayer>`). |
| `unregisterLayer` | `(id: string) => void` | Remove a layer and free its GPU resources. |
| `setLayerOpacity` | `(id, opacity) => void` | Delegates to the layer's own `setOpacity` closure (which handles background-removal LUT curves if needed). |
| `setLayerTransform` | `(id, transform: LayerTransform) => void` | Apply a rigid translate/rotate/scale to an overlay layer. |
| `setLayerWindowLevel` | `(id, center, width) => void` | Update window/level for a continuous overlay layer. |
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
| `opacity` | `number` | `1` | Initial layer opacity (0–1). |
| `lut` | `string` | `'hot_and_cold'` | LUT name for continuous overlays (any AMI.js `LutHelper` preset). Ignored in segmentation mode. |
| `windowCenter` | `number` | stack default | Initial window centre for contrast. |
| `windowWidth` | `number` | stack default | Initial window width for contrast. |
| `interpolation` | `0 \| 1` | `1` | `0` = nearest-neighbour (for label maps), `1` = trilinear (default). |
| `segmentation` | `object` | — | Switch to label-map mode. See below. |
| `backgroundRemoval` | `boolean \| { threshold?: number }` | — | Enable air transparency for CT overlays. Voxels below the threshold (default: `0.2` of normalised intensity) are kept transparent using an opacity LUT curve. Setting `opacity` via `setLayerOpacity` rebuilds the curve automatically. |

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

After mount, any layer registered in the context can be controlled via actions:

```ts
// Adjust opacity
ctx.setLayerOpacity('activation', 0.5);

// Adjust contrast
ctx.setLayerWindowLevel('activation', 400, 800);

// Apply a rigid co-registration nudge (translate in mm, rotate in degrees, scale)
ctx.setLayerTransform('activation', {
  translate: [2, -1, 0],
  rotate: [0, 0, 1.5],
  scale: [1, 1, 1],
});
```

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
| `viewports` | `OrientationMode[]` | all four | Restrict the overlay to specific viewports, e.g. `['axial', '3d']`. |
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
| `onClick` | `(ctx: DicomViewerContext, fiber: Canvas3DRootState \| null) => void` | Called with both the DICOM context and the R3F root state. `fiber` is `null` only before the canvas mounts. |
| `active` | `boolean` | Highlighted (blue) background when `true`. |
| `disabled` | `boolean` | Dims the button and suppresses click. |
| `style` | `CSSProperties` | Inline style overrides. |

`fiber` is the same `Canvas3DRootState` exposed by `useFiber()` in Canvas3D — it contains `camera`, `scene`, `gl`, `controls`, and `invalidate`. DICOM buttons receive it in addition to `ctx` so they can directly interact with the render engine when needed.

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

const { stack, loading, error } = useVolumeLoader('/brain.nii.gz');
```

- Calls `stack.prepare()` and `loader.free()` after loading to release raw frame buffers.
- Returns `null` for `stack` while loading or on error.
- Re-triggers when the URL changes.

### `useLayerStack`

Like `useVolumeLoader` but keeps `_rawData` intact (no `loader.free()`) because `createLayerMaterial` needs the raw buffer to build GPU `DataTexture`s. Used internally by `<DicomLayer>`.

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

## Performance notes

- **Demand rendering** — `frameloop="demand"` is set on the R3F Canvas. Frames are only rendered when state changes. The `StoreInvalidator` component (inside the Canvas) subscribes to `useDicomViewerStore` and calls `invalidate()` whenever this viewer's record changes, so toolbar actions and slice navigation trigger rendering automatically.

- **`animationSkipRate`** — set to `2` or `3` to render every 2nd or 3rd frame when the scene is very complex. This reduces GPU load at the cost of slightly less responsive interaction.

- **Scissor rendering** — the single WebGL context renders all four viewports in one pass per frame. There is no per-viewport clear; `FrameClearer` clears the full canvas once at the start of each frame.

- **Layer disposal** — `DicomLayer` disposes its `ShaderMaterial` and all `DataTexture`s on unmount. If the WebGL context has already been destroyed at that point (e.g. the parent component unmounts), disposal errors are silently swallowed.

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
  | ((ctx: DicomViewerContext, point: THREE.Vector3, event: MouseEvent) => void);
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
  DicomViewerContextType, // DicomViewerContext re-exported under this name to avoid collision with the React context object
  ViewportHandle,
} from '@metacell/geppetto/dicom-viewer';
```
