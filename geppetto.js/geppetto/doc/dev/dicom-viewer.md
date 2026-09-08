# dicom-viewer — developer notes

Deeper rationale, invariants, and verified-against-source facts that used to live as block
comments throughout `src/dicom-viewer/`. Quick one-line markers stayed in the code; anything
longer that explains _why_ (not just _what_) was moved here so the source stays readable while
this knowledge stays discoverable. Organized by file, in source-tree order.

## `canvas-context.ts`

`CanvasIdContext`/`useFiberStore`/`CanvasRootState` here are independent from `3d-canvas`'s
`Canvas3D`/`Toolbar3D` versions of the same pattern. They look similar but aren't the same thing:
`3d-canvas`'s `Canvas3DRootState` narrows `controls` to `CameraControls` for its pan/zoom/rotate
toolbar groups, whereas a `DicomViewer` viewport's controls are ami.js's `TrackballControl` /
`TrackballOrthoControl` — casting into `3d-canvas`'s type would be a lie. Keeping `dicom-viewer`
self-contained also means this folder doesn't require the sibling `3d-canvas` module to exist.

## `index.ts`

`CanvasIdContext`/`useCanvasId`/`useFiber` are re-exported as `DicomCanvasIdContext`/
`useDicomCanvasId`/`useDicomFiber`. This aliasing is required, not stylistic: `@metacell/geppetto`'s
root barrel (`src/index.ts`) does `export * from "./3d-canvas"` and `export * from "./dicom-viewer"`,
and `3d-canvas` already exports `CanvasIdContext`/`useCanvasId`/`useFiber` under those exact names
for its own independent store — re-exporting dicom-viewer's copies unaliased would be an ambiguous
duplicate export and fail to build.

## `types.ts`

- **`ViewportInteractions`**: the six per-viewport mouse callbacks (`onClick`, `onCtrlClick`,
  `onShiftClick`, `onDoubleClick`, `onRightClick`, `onHover`) bundled into one object instead of six
  separate props, threaded through `DicomViewer -> DicomCanvas -> Viewport2D/3DContent ->
useViewportEvents` as a single `interactions` prop. Six independent optional props meant six names
  to repeat (and keep in sync) at every layer of that chain; bundling them means adding a seventh
  interaction later only touches `ViewportInteractions` and the one component that acts on it, not
  every intermediate layer's prop list. `NO_INTERACTIONS` (`{}`) is a stable default so a consumer
  that never passes `interactions` doesn't get a fresh `{}` — and therefore a spurious effect
  re-run — every render.
- **`ViewMode` / `PaneDescriptor` / `ViewLayouts`**: `ViewMode` was a closed
  `'single_view' | 'quad_view'` union; it's now `'single_view' | 'quad_view' | (string & {})` — a
  lookup key into a `ViewLayouts` map (`Record<string, PaneDescriptor[]>`) rather than a name
  geppetto has to know ahead of time. `DEFAULT_VIEW_LAYOUTS` (in `viewports/DicomCanvas.tsx`)
  supplies `quad_view`/`single_view` as plain 4-element `PaneDescriptor[]` arrays using the ids
  `'3d'`/`'axial'`/`'sagittal'`/`'coronal'` — the built-ins are written the same way a custom mode
  would be, not special-cased. A consumer adds a mode by spreading that map and adding its own
  array, passed as `viewLayouts` with the new key as `mode`.

  This went through three shapes before landing here, each rejected for a concrete reason:
  1. A registry/plugin API (register/unregister calls, imperative state) — rejected in favor of a
     plain object passed as a prop, exactly as easy to compose/override/test as any other prop.
  2. A `ViewLayoutFn = (pane, activeOrientation) => CSSProperties` map — positioning-only, covered
     custom layouts for the four standard panes but couldn't mount additional panes or filter which
     layers a pane draws, both of which HFO's `dual_row_view`/`three_d_row_view` genuinely need
     (CT-only solo panes). This is the shape still described in old design notes; superseded.
  3. A `ViewDescriptor = { panes, onRender }` wrapper (one `onRender` per named view, for the whole
     view) — rejected once the aggregation it existed for turned out not to need a framework-level
     mechanism at all: a consumer who wrote the pane list already knows how many panes it has, so
     they can count their own per-pane callbacks instead of the framework doing it for them. Once
     `onRender` moved to `PaneDescriptor` (per pane), the wrapper had nothing left to hold, so
     `ViewLayouts` collapsed to a bare `PaneDescriptor[]` per key.

  `PaneDescriptor.id` is the pane's stable identity — see `viewports/DicomCanvas.tsx`'s sticky-mount
  entry. Two panes may share a `planeOrientation` (an MRI-axial pane and a CT-only-axial pane side
  by side) as long as their ids differ; by default each still scrubs independently (see
  `PaneDescriptor.syncSliceWith` and `hooks/useDicomViewerStore.ts`'s "sliceIndices keyed by slice
  key" entry) — sharing an orientation no longer implies sharing a slice position, that's opt-in.
  `PaneDescriptor.onRender`
  fires once, ever, per pane id, with `(handle, siblings)` — `siblings` is every pane of the same
  view that's already fired, keyed by id inclusive of the pane itself, letting the _last_ pane to
  become ready detect the complete set and perform cross-pane wiring without the framework doing
  it. `DicomViewerProps.onRender` is the generalization of the old fixed-4-viewport callback: it
  now fires per view _activation_ (keyed by `mode`), with a `Record<string, ViewportHandle>` scoped
  to that view's own pane ids, instead of assuming exactly 4 viewports indexed 0-3 (`VP_ID_MAP` is
  gone; `ViewportHandle.id` is now the pane's string id).

  Deliberately still narrow: no per-pane LUT override (a layer's LUT lives on its shared
  `THREE.ShaderMaterial`, reused by every pane that draws it — a real per-pane override needs
  per-pane material cloning, not built), and scene-nesting / localizer cross-ref wiring
  (`registerViewportScene`'s 3D-adopts-2D behavior, `initLocalizerCrossRefs`) are unchanged,
  hardcoded to the four canonical ids only — see their own entries below for what that means for a
  custom pane. Both deferred until a real second consumer needs them, per the same reasoning as
  before: HFO's migration is separately blocked on a React 18→19 upgrade, so nothing exercises this
  today.

  `kind`/`planeOrientation` started out required on every `PaneDescriptor`, which meant
  `DEFAULT_VIEW_LAYOUTS` had to restate them for every canonical pane in _both_ `quad_view` and
  `single_view` (8 repetitions of the same 4 facts), and a consumer repositioning a canonical pane
  in a custom mode had to restate them too — with nothing stopping `{ id: 'coronal', planeOrientation:
'sagittal' }` from compiling and silently misbehaving. Fixed by making both optional and deriving
  them from `id` for the four canonical ids (`resolvePaneKind` in `viewports/DicomCanvas.tsx`) —
  any `kind`/`planeOrientation` a descriptor sets for one of those ids is simply never read. A
  descriptor introducing a new id still has to supply `kind` itself (and `planeOrientation` if it's
  a 2D pane); `resolvePaneKind` throws a descriptive error if it's missing, since there's nothing to
  infer it from and failing loudly beats a silent crash three layers down in `Viewport2DContent`.

- **`LayerState`**: represents a loaded overlay volume's GPU resources + controls. `setOpacity`
  encapsulates the background-removal logic so callers don't need to know whether the layer uses
  a plain uniform or an air-alpha LUT curve.
- **`planeStackOrientations`**: each 2D viewport's actual ami.js `camera.stackOrientation`
  (0/1/2), i.e. which IJK axis that plane's slices step along. This depends on the volume's
  acquisition orientation, not a fixed axial/sagittal/coronal → z/x/y mapping — `centerOnPoint`
  uses it to convert a world point to the right slice index per plane.
- **`threshold3D`**: intensity threshold value for the 3D viewport. Only applied when
  `threshold3DEnabled` is true. Fragments with raw intensity below this value are discarded
  (transparent).
- **`threshold3DEnabled`**: whether the threshold is currently active. Decoupled from the value so
  a slider can set the value without inadvertently activating transparency, and the toolbar button
  can toggle on/off without resetting the slider position.
- **`setSliceMaxIndex`**: per-plane setter (preferred) — uses a functional Zustand update so
  concurrent calls from multiple viewports cannot overwrite each other's values.
- **`centerOnPoint`**: converts a world (LPS) point to IJK and sets all 3 plane slice indices to
  center on it, using each plane's real `planeStackOrientations` mapping. Single source of truth
  for "center on this point" — used by click-to-center (`useViewportEvents.ts`'s `goToPoint`) and
  any other externally-triggered request.
- **`viewportScenes`**: per-viewport scene objects — populated by `Viewport*Content` components
  once ready. `DicomOverlay` uses these to portal overlay children into individual scenes.
- **`HoverAction`**: fired on every (rAF-throttled) pointer move over a viewport, and once more
  with `point=null` on mouseleave. Point is null whenever the pointer isn't over any raycastable
  geometry (e.g. outside the loaded volume).
- **`overlay` prop**: DOM / HTML content (toolbar, HUD) — rendered outside the Canvas in a normal
  React DOM tree so that HTML elements are not mistaken for Three.js objects.
- **`DicomViewerContext` omits `sliceIndices`**: it's the highest-frequency write in the viewer —
  every wheel tick during a scrub — and it used to be part of the context, which meant every tick
  produced a new context value and re-rendered every consumer (every viewport, every overlay).
  Components that need it call `useSliceIndices(useDicomCanvasId())` instead, so only they
  re-render. `DicomViewerState` itself still has the field (the store needs it); only the context
  type omits it.

## `utils.ts`

- **`VP_ID_MAP` (removed)**: used to map orientation → numeric viewport index (0=3d, 1=axial,
  2=sagittal, 3=coronal) back when `ViewportHandle.id` was a number. Once panes became an
  arbitrary, consumer-describable list (`PaneDescriptor[]`), a numeric 0-3 index no longer means
  anything — `ViewportHandle.id` is now the pane's own string id, and `onRender` hands back a
  `Record<string, ViewportHandle>` instead of a fixed-length array.
- **`ijkComponentForStackOrientation`**: extracts the IJK component that corresponds to a given
  ami.js `camera.stackOrientation`. Per ami.js conventions:
  - `stackOrientation 0` → `directions[2]` (zCosine, K axis → `ijk.z`)
  - `stackOrientation 1` → `directions[0]` (xCosine, I axis → `ijk.x`)
  - `stackOrientation 2` → `directions[1]` (yCosine, J axis → `ijk.y`)
- **`centerSlicesOnPoint`**: converts a world (LPS) point to IJK via the stack's `lps2IJK` matrix
  and sets all 3 plane slice indices to center on it. `planeStackOrientations` carries each
  plane's actual `camera.stackOrientation` (see `Viewport2DContent.tsx`), since which IJK axis
  maps to which plane depends on the volume's acquisition orientation, not a fixed assignment —
  assuming axial/sagittal/coronal always map to z/x/y is only correct for axially-acquired
  volumes.
- **`soToCol`**: maps an ami.js `camera.stackOrientation` to the `ijk2LPS` column index for that
  plane's normal — the same `stackOrientation → axis` convention as
  `ijkComponentForStackOrientation` above, applied to matrix columns instead of vector components:
  `stackOrientation 0` → K axis (col 2), `1` → I axis (col 0), `2` → J axis (col 1).
- **`makePlaneFilter`**: returns a predicate testing whether an LPS point lies within `tolerance`
  of the slice plane defined by `ijk2LPS` column `col` at index `sliceIdx`. Generic spatial filter
  for any overlay that needs "show this marker only on the currently displayed slice" — pass a
  tolerance matching the rendered marker's radius so the visual clipping lines up with the spatial
  filter.

## `hooks/usePlaneFilters.ts`

Builds one spatial `PlaneFilter` per anatomical plane from the current stack, each plane's slice
index and `camera.stackOrientation`. Shared by any overlay that clips its content to "this slice
only" so the memoization and the ami.js `stackOrientation` fallback only need to be correct in one
place.

## `hooks/useDicomViewerStore.ts`

- One Zustand store for all `DicomViewer` instances in the page, keyed by the viewer `id` prop —
  same pattern as `useFiberStore` in `Canvas3D`.
- **`setSliceIndex`**: functional update (via `updateViewer`) avoids stale-spread races when
  multiple viewports initialise concurrently.
- **`sliceIndices` keyed by "slice key", not `PlaneOrientation`**: it was a fixed 3-slot
  `Record<PlaneOrientation, number>` — fine when at most one pane per orientation exists, but once
  a custom view can declare a second pane at the same `planeOrientation` (e.g. `dual_row_view`'s
  layer row), a single shared slot per orientation forces those panes to always show the same
  slice with no way to opt out. Widened to `Record<string, number>`, defaulting each pane's key to
  its own `id` (`PaneDescriptor.syncSliceWith`, resolved in `Viewport2DContent` as
  `sliceKey = syncSliceWith ?? id`) — independent by default, synced only when a descriptor asks
  for it. The canonical panes' ids equal their orientation, so `sliceIndices.axial` etc. keeps
  meaning what it always meant; this is the same "canonical id doubles as the key" convention
  already used for `viewportScenes`. `sliceMaxIndices`/`planeStackOrientations` stay
  `PlaneOrientation`-keyed — they're facts about the stack at that orientation, not navigation
  state, and are identical for every pane sharing an orientation regardless of sync.
- **The initial-slice seed only runs for the slot's own owner**: `Viewport2DContent`'s
  "stack helper ready" effect used to unconditionally call `setSliceIndex(planeOrientation,
maxIdx/2)` once per pane mount. With a shared/synced slot, that would reset an already-navigated
  position back to the middle every time a _new_ pane sharing that slot mounts (e.g. opening
  `dual_row_view` for the first time re-centering an `axial` pane the user had already scrubbed).
  Guarded to `if (!syncSliceWith)` — only the slot's actual owner ever seeds it; a synced pane
  relies on whichever pane it's synced to (in practice always a canonical pane, mounted since the
  viewer's very first render) to have already done this.
- **`setLayerOpacity`/`setLayerTransform`/`setLayerWindowLevel`/`setLayerLut`**: these mutate the
  layer's GPU uniforms imperatively (`setOpacity`/`setTransform`/`setWindowLevel` close over the
  material's uniforms directly — see `createLayerMaterial.ts`), so the viewer record itself never
  changes shape. Bumping just the viewer record's identity is what tells `StoreInvalidator` to
  redraw on `frameloop="demand"` — but consumers decide whether to rebuild/refresh against the
  `layers` ARRAY's own identity specifically (see `Viewport2DContent`'s "layers changed" effect),
  so a plain record-identity bump alone isn't enough: any reader that isn't the one currently
  driving the edit would never re-evaluate against the new value until something unrelated
  happened to trigger it. Bump `layers` too so every consumer reliably reacts to every
  opacity/window-level/LUT/transform edit.
- **`useDicomViewer` vs `useDicomViewerStable` vs `useSliceIndices`**: three selectors over the same
  record, for three different needs. `useDicomViewer` subscribes to the whole record by reference —
  simplest, but re-renders on every patch including slice scrubbing, the highest-frequency write in
  the viewer. `useDicomViewerStable` shallow-compares the record with `sliceIndices` stripped out
  (via `useShallow`), so a slice patch — which only touches that one field — produces a new record
  object that shallow-equals the old one everywhere else, and the hook does not re-render;
  `DicomViewer.tsx` uses this one for its own subscription. `useSliceIndices` is the complement: a
  narrow selector over just that field, for the few consumers (2D viewports, slice-aware overlays)
  that actually need it. It returns the store's own object reference rather than constructing one,
  since several call sites put it straight into a `useEffect`/`useMemo` dependency array — a fresh
  object per call would re-run those on every unrelated patch, which is the exact cascade this hook
  exists to avoid.

## `hooks/useLocalizerSync.ts`

- **`initLocalizerCrossRefs`**: called once after all three viewports are initialised. Wires each
  `LocalizerHelper` with the other two planes' equations and border colours.
- **`useLocalizerSync`**: returns `syncAll()` which re-synchronises all three localizers after any
  slice navigation. Called by `ctx.syncLocalizers()` from `Viewport2DContent`.

## `hooks/useViewportEvents.ts`

- **`expandView`**: expands the clicked viewport to fill the container (`single_view`), or
  collapses back to `quad_view` if already in `single_view`. Shows only the clicked viewport — for
  2D planes uses that plane's orientation; for the 3D pane keeps orientation as `'3d'`.
- **Hover throttling**: raycasting is throttled to one pick per animation frame, but always
  raycasts from the LATEST event (not the one that happened to schedule the pending frame), or the
  hover position would visibly lag/snap while throttled.

## `hooks/useVolumeLoader.ts`

- **`UseVolumeLoaderOptions.retainRawData`**: when true, skips `loader.free()` and calls
  `stack.pack()` after `prepare()` — needed by overlay layers (see `useLayerStack`) whose raw
  buffers must survive for texture building, unlike the base volume which frees its loader eagerly
  once packed.
- `useVolumeLoader` loads a DICOM/NIfTI/NRRD volume and returns the prepared `StackModel`. Calls
  `loader.free()` after `prepare()` to release raw frame buffers, unless `options.retainRawData`
  is set.

## `hooks/useLayerStack.ts`

Overlay layers (see `DicomLayer`) need the raw loader buffers to survive `prepare()` so
`createLayerMaterial` can still read them when building the layer's texture — unlike the base
volume loaded via `useVolumeLoader` itself, which frees its loader as soon as it's packed.

## `layers/createLayerMaterial.ts`

- **`LUT_PRESETS`**: valid `lut` names — the keys of ami.js's `LutHelper.presetLuts()`, spelled
  out here so consumers can build a LUT picker without reaching into ami.js directly. Verified
  against the ami.js fork source (`helpers.lut.js`) — exact match, same order.
- **`buildAirAlphaLut`**: builds the air-alpha opacity LUT curve that makes background voxels
  transparent while keeping tissue fully opaque at any normal opacity value. Called on first
  creation and again whenever opacity changes for continuous layers.
- **`refreshLutTexture`** (GPU leak fix): ami.js's `LutHelper.texture` getter allocates a
  brand-new `THREE.Texture` (wrapping the same backing canvas) on every single access — it's
  never cached. `setOpacity`/`setLut` reassign it on every slider tick / LUT change, so the
  texture this REPLACES must be disposed here, or it leaks its GPU-side resource forever:
  `DicomLayer`'s own unmount cleanup only ever sees the last one assigned, not the many discarded
  in between.
- **`applyLayerTransform`**: applies a rigid transform (translate/rotate/scale) to a layer by
  composing the overlay's base `lps2IJK` with the inverse of the transform matrix and writing the
  result into `uWorldToData`. This enables runtime co-registration nudging without reloading the
  volume. Composition order is `T * R * S * T0` (rotate/scale around volume centre, then
  translate); for simplicity the transform is computed relative to origin — callers who need
  centre-anchored rotation should pre-translate before calling.
- **`createLayerMaterial`**: pure factory that creates a GPU material + uniforms for one overlay
  volume. Returns a `LayerState` without an id or renderOrder — the caller assigns those.
- **`amiOffset`**: ami.js's data shader expects non-negative intensities and shifts volumes with a
  negative minimum (e.g. CT in Hounsfield units, which go below 0) up by this offset when packing
  textures. Window/level and threshold uniforms are compared against those shifted values, so they
  must be offset the same way or they'll be wrong for any volume with negative intensities.
- **`applyWindowLevel`**: single source of truth for the `amiOffset` math — used by both the
  `backgroundRemoval` and default `setWindowLevel` closures so the offset can't drift out of sync.
- **Segmentation branch**: label map — LUT is keyed by integer label. Background label 0 has
  alpha 0 in standard presets — always transparent.

## `layers/DicomLayer.tsx`

Declarative multi-image overlay layer component. Drop a `<DicomLayer>` inside `<DicomViewer>` to
load an additional volume and blend it on top of the base stack. The layer is registered in the
context store so toolbar buttons / custom controls can mutate its opacity / LUT / transform at
runtime. GPU resources (`ShaderMaterial` + `DataTexture`s) are created once and disposed when the
component unmounts. For CT background removal (air transparency) pass `backgroundRemoval={true}`
— the LUT-based technique keeps background voxels transparent while tissue remains fully opaque
(see `createLayerMaterial.ts`).

Window/level and LUT are independent knobs but often change together (e.g. a preset switch resets
both), so they share one effect rather than firing two separate store updates (and two
invalidates) per user action.

The mount/register effect waits for both the base stack (for geometry/orientation) and the
overlay stack (for texture data) to be ready before creating the layer.

## `layers/DicomOverlay.tsx`

- **`coordinateSystem`**: `'world'` (default) places children in LPS/world space. `'voxel'` places
  children in IJK voxel space — the `ijk2LPS` matrix is applied automatically so positional props
  use voxel indices.
- Renders children into one or more viewport scenes via R3F `createPortal`. By default the overlay
  appears in all four viewports. Pass `viewports` to restrict to a specific set, e.g.
  `viewports={['axial', '3d']}`. With `coordinateSystem="voxel"` children are wrapped in a group
  whose matrix is the stack's `ijk2LPS` transform, so positions expressed in IJK indices are
  automatically converted to world space.
- Triggers a render when the overlay mounts or unmounts so the scene reflects the change
  immediately — consumers do not need to call `invalidate()` themselves.
- **3D bleed-through fix**: the portal root is tagged with `userData.isDicomOverlayPortal` so
  `Viewport3DContent` can find and hide these portal roots for its render pass — the 2D scenes are
  nested into the 3D scene for slice-plane rendering, which would otherwise also drag in overlays
  whose `viewports` prop excludes `"3d"`.
- **Portal key bug**: each viewport's portal must get a distinct React `key` (there's one per
  entry in `viewports`), but R3F's `createPortal(children, container, state)` takes a `RootState`
  override as its 3rd argument — not a key. Passing `{ key: vp }` there silently merges into
  `state` and never actually keys the element, so the fix wraps the portal in
  `React.cloneElement(createPortal(...), { key: vp })` instead.

## `preconf/DicomViewer.tsx`

- **`StandardToolbar`**: rendered inside `<DicomViewer>` so it has access to the
  `DicomViewerContext`. Reads context directly so button active-states are kept in sync with store
  state (e.g. `threshold3D` toggle). Pass `extra` to append additional buttons at the end of the
  toolbar — useful for application-specific actions that need to live alongside the built-in
  buttons without replacing the whole toolbar.
- This component is a convenience wrapper — adds default toolbar + sensible click defaults.
  Mirrors the old `preconf/DicomViewer.js` behaviour while using the new API.
- **`DEFAULT_INTERACTIONS`**: `{ onClick: 'goToPoint', onCtrlClick: 'expandView' }`, merged with
  whatever the consumer passes as `{ ...DEFAULT_INTERACTIONS, ...interactions }` — a plain object
  spread, not per-field default params, since `interactions` is now a single object rather than six
  independently-defaultable props. A consumer's own `onClick`/`onCtrlClick` overrides the default;
  any other field they set (e.g. `onHover`) passes through untouched.
- **`toolbarExtra`**: extra buttons / nodes appended inside the built-in toolbar after the last
  separator. Use `DicomViewerButton` / `Toolbar3DSeparator` for consistent styling.
- **`extraOverlay`**: extra DOM elements appended to the overlay alongside the built-in toolbar.
  Use this for custom HUD elements, not for R3F scene content (use `children` for that).
- The toolbar + any extra overlay elements are DOM content — passed via `overlay` so they render
  outside the WebGL Canvas (`children` go inside the R3F Canvas as scene content).

## `toolbar/DicomViewerButton.tsx`

- **`onClick`**: receives both the DICOM domain context and the underlying R3F fiber state.
  `fiber` is null only if the canvas has not mounted yet — guard before use.
- A toolbar button with access to both the `DicomViewer` domain context and the underlying R3F
  canvas state. Must be rendered inside a `<DicomViewer>` so both `DicomViewerContext` and
  `CanvasIdContext` are available.

## `toolbar/DicomViewerToolbar.tsx`

- **`DicomViewerIdContext`**: internal context that passes the viewer id down to
  `DicomViewerButton` without requiring every button to receive it as an explicit prop.
- Thin container that establishes the viewer id context for its children. Mirrors the `Toolbar3D`
  pattern — no styling opinions beyond defaults.

## `viewports/DicomCanvas.tsx`

- **`StoreInvalidator`**: subscribes directly to the Zustand store (not via React context) and
  calls `invalidate()` only when this viewer's state actually changes. Using the raw store
  subscription means zero React re-renders are involved — no risk of creating a spurious render
  loop. Uses Zustand v3's basic subscribe form — `listener(newState, prevState)` — since the
  single-argument form avoids the deprecated `subscribeWithSelector` path (triggered whenever a
  second argument is present). Also calls `scheduler.bumpSharedRevision()` before `invalidate()` —
  this is the ONLY place shared-state changes are reported to the render scheduler, and it's what
  lets sibling viewports redraw their localizer crosshairs even while another viewport is being
  dragged (see `viewports/renderScheduler.ts`).
- **`FpsTracker`**: counts `useFrame` calls (= actual WebGL frames rendered) and reports via
  callback. Must live inside the Canvas so it has access to the R3F render loop. With
  `frameloop="demand"`, `useFrame` stops firing when idle, so it schedules a 600 ms decay timeout
  after each frame — if no new frame arrives in time the counter resets to 0, giving an accurate
  "idle = 0 fps" reading.
- **`FiberRegister`**: registers this `DicomViewer`'s R3F canvas in `dicom-viewer`'s own
  `useFiberStore` so that `DicomViewerButton` (and any component using `useFiber`) can look it up
  by `viewerId`. Mirrors `Canvas3D`'s `FiberBridge` conceptually, but uses an independent store —
  must live inside `<Canvas>` to call `useThree()`.
- **`FrameClearer`**: no longer clears the canvas unconditionally every frame. It requests a full
  clear (via the render scheduler) whenever the layout changes — `viewMode`, `orientation`, or the
  canvas' own `size` — and otherwise only clears when one is actually pending, right before any
  viewport renders (priority -1, before all viewport renders at priority 1). It also calls
  `scheduler.beginFrame(performance.now())` first, once per frame, so the "may siblings redraw this
  frame" decision is made exactly once and every viewport sees the same answer instead of each
  computing it independently (and possibly disagreeing at a throttle-window boundary). Per-frame
  unconditional clearing was removed because it's incompatible with per-pane render gating: a
  viewport that skips a frame needs its previous pixels still on screen, not a canvas that was just
  wiped out from under it.
- **`RenderSchedulerContext.Provider`**: one `RenderScheduler` instance is created per `DicomCanvas`
  (via `useRef`, lazily) and provided here, inside the `<Canvas>`. Every viewport, `StoreInvalidator`
  and `FrameClearer` read it via `useRenderScheduler()`. See `viewports/renderScheduler.ts` for what
  it does and why.
- **`gl={{ antialias: false, preserveDrawingBuffer: true, ... }}`**: both changed from the earlier
  `{ antialias: true }` with no `preserveDrawingBuffer`. `antialias: false` — MSAA costs little on a
  GPU but is expensive under software rendering (SwiftShader/llvmpipe, what a machine without
  hardware acceleration falls back to); these panes are volume slices, where it buys almost nothing
  visually. `preserveDrawingBuffer: true` is REQUIRED by per-pane render gating: WebGL clears the
  drawing buffer after every composite unless told not to, so a viewport that skips a frame would
  render nothing and go black instead of keeping its previous pixels.
- **Container-ref race fix**: `useState` (not `useRef`) is used so the container div's presence is
  known via React state — R3F's `eventSource` is read once at `<Canvas>` mount, so a plain ref
  object (still null on first render) would hand it a stale/empty `eventSource`. A callback ref
  lets `<Canvas>` mounting be delayed until the container div actually exists in the DOM.
  `pointer-events: none` on the canvas so tracking divs receive mouse/wheel events; R3F listens via
  `eventSource={containerEl}` so raycasting still works.
- **Pane rendering — `mountedIds` / `domRefsRef` / `descriptorByIdRef`**: panes are no longer four
  fixed JSX blocks with fixed refs (`r0Ref`..`r3Ref`); they're derived from `activePanes`
  (`viewLayouts[viewMode]`, falling back to `single_view`) and rendered by mapping over
  `mountedIds`. `domRefsRef` is a `Map<id, RefObject>`, created lazily per id via `getDomRef` and
  never removed, so a pane's tracking div and its `Viewport2/3DContent` instance always share the
  same ref across renders. `descriptorByIdRef` remembers each pane's last-seen descriptor (updated
  from `activePanes` every render) so a sticky-mounted-but-currently-inactive pane still knows its
  own `kind`/`planeOrientation`/etc. even once it's dropped out of `activePanes`.
- **Sticky mount (`mountedIds` state)**: once a pane id has appeared in `activePanes`, it's added to
  `mountedIds` and never removed — an effect on `[activePanes]` appends any new ids each time the
  active view changes. A pane not in the current `activePanes` renders with `HIDDEN_STYLE` instead
  of being unmounted. This exists because recreating a 2D pane's `TrackballOrthoControl`/camera (or
  a 3D pane's orbit controls) on every mode toggle is real, felt cost — confirmed by HFO's own
  `dualRowEverActive` flag doing the same thing for exactly this reason before this mechanism
  existed generically here.
- **Render-readiness tracking (`checkReady`)**: `sceneByIdRef` captures each pane's scene/camera as
  soon as they exist (the pane's `onReady`); `handlesByIdRef` only gets an entry once that pane has
  actually painted its first frame (`onFirstFrame`). `checkReady` runs after every pane's first
  frame and also once on every `[viewMode, activePanes]` change (a sticky-mounted pane from an
  earlier activation may already be ready, so switching back to a familiar mode can complete
  instantly). It does two things: fires each pane's own `PaneDescriptor.onRender` exactly once
  (guarded by `paneFiredRef`, a `Set<string>` that only grows), and — once every id in `activePanes`
  has a handle — fires the top-level `onRender` prop with a `Record<string, ViewportHandle>` scoped
  to that view, guarded by `aggregateRef` (reset whenever `viewMode` changes, so each view
  activation gets its own one-time firing).
- **`markFirstFrame()` moved earlier in `Viewport2/3DContent`'s `useFrame`**: it used to fire only
  after a non-zero-size scissored render, at the very end of the frame callback. A hidden pane
  (`HIDDEN_STYLE` → zero size) never reaches that point, so under the old placement a
  sticky-mounted-but-inactive pane would never be considered "ready" — deadlocking `checkReady`'s
  aggregate check for any view whose declared pane set includes ids that are hidden for the current
  orientation (e.g. `single_view`, whose 3 inactive canonical panes are zero-size by design). Moving
  the call to right after the `if (!handle || !domRef.current) return;` guard — before the
  skip-rate/scheduler-throttle/zero-size checks — means "ready" now means "this pane's render loop
  has run at least once," which for a hidden pane is already the final state (nothing more will
  ever happen while it stays hidden). For a visible pane this can very occasionally fire one frame
  before the actual first GL paint (if `animationSkipRate > 1` or a scheduler throttle skips the
  very first tick); accepted as a minor, effectively unobservable trade-off in the common case
  (`animationSkipRate` defaults to 1, and nothing throttles a freshly-mounted pane before any
  interaction has begun).
- **`onViewport2DReady` / registerViewportScene keyed by pane `id`, not orientation**: both
  `Viewport2DContent` and `Viewport3DContent` now take an `id` prop (the pane's own id) and use it,
  not `planeOrientation`, when calling `ctx.registerViewportScene`. This matters as soon as two
  panes can share a `planeOrientation` (an MRI-axial pane and a CT-only-axial pane, say) — keying
  by orientation would let the second one silently overwrite the first's `viewportScenes` entry.
  Keying by id instead means each pane's scene registers under its own key; the canonical panes'
  ids equal their orientation, so `DicomOverlay`'s default targeting and the 3D-scene-nesting logic
  in `DicomViewer.tsx` (both still hardcoded to `'3d'`/`'axial'`/`'sagittal'`/`'coronal'`) keep
  working unchanged — a custom pane just adds a non-colliding extra entry they don't look at yet.
  `onHandleReady` (localizer cross-ref registration) is additionally guarded to only fire when
  `id === planeOrientation`, i.e. only for a pane that IS the canonical one for its orientation —
  otherwise a same-orientation custom pane would overwrite the canonical pane's slot in
  `vpLocalizersRef` and corrupt the axial/sagittal/coronal cross-ref triangle.

## `viewports/renderScheduler.ts`

**Why it exists.** All four viewports (3D + 3 orthogonal planes) render into one R3F
`<Canvas frameloop="demand">`, scissored to their own tracking-div rect. Each viewport has its own
`useFrame`, so a single `invalidate()` — one mouse move — reruns all four. On a real GPU that's
free. Under software rendering (SwiftShader/llvmpipe — what a machine with no hardware acceleration
falls back to) it's a 4x CPU multiplier on every pointer move, and it's the reason dragging or
scrubbing felt disproportionately slow compared to how little actually changed on screen: three of
the four viewports were doing full render work every frame for no visible reason, since only one of
them was under the pointer.

**What it does.** One rule replaces "redraw everything on every invalidate": while a viewport is
under an active pointer interaction, render only that viewport at full rate; the other three
throttle to ~8fps (`SIBLING_REDRAW_INTERVAL_MS`), and even then only on a frame where _shared_
viewer state actually changed. That exception is what keeps the localizer crosshairs correct:
scrubbing slices in one 2D viewport writes into `useDicomViewerStore`, which — via
`StoreInvalidator`'s `bumpSharedRevision()` — tells every sibling "something you display changed, you
need to redraw your crosshair on this frame." Orbiting the 3D viewport touches no shared state, so
the 2D viewports correctly sit still while it moves. Idle behaviour (nothing being interacted with)
is completely unchanged — every viewport renders on every `invalidate()`, exactly as before this
existed.

**How it integrates.**

- `DicomCanvas` creates exactly one `RenderScheduler` per canvas (`createRenderScheduler()`, held in
  a `useRef` so it survives re-renders) and provides it via `RenderSchedulerContext`, INSIDE the
  `<Canvas>` — R3F runs Canvas children through a separate reconciler, so a provider outside it would
  never reach the viewports. It must be one-per-canvas, never module-level state: an app can mount
  several `<DicomViewer>`s on one page, and a shared gate would let a drag in one freeze every pane
  of all the others.
- Each viewport (`Viewport2DContent`, `Viewport3DContent`) creates one stable identity object
  (`const paneId = useRef({}).current`) to identify itself to the scheduler — object identity avoids
  needing a naming scheme that stays unique across every possible view-mode/layout combination.
- On `pointerdown` a viewport calls `scheduler.beginInteraction(paneId)`; on release,
  `scheduler.endInteraction()`. A 2D viewport's wheel handler does the same around a scrub (see
  below), since a wheel gesture has no down/up pair to bracket it.
- Every `useFrame`, before doing any GL work, calls
  `scheduler.shouldRenderPane(paneId, lastDrawnRevision.current)` and bails out if it returns
  false — skipping the scissor/clear/render entirely and leaving whatever was already drawn on
  screen (safe only because of `preserveDrawingBuffer: true`, see `DicomCanvas.tsx` above).
- `FrameClearer` calls `scheduler.beginFrame(now)` once per frame, before any viewport's `useFrame`
  runs (R3F priority -1 vs. the viewports' priority 1) — this is what makes the "may siblings redraw"
  decision get made exactly once per frame and seen identically by every viewport, instead of each
  one computing it independently and possibly disagreeing right at a throttle-window boundary.
- **Release-outside-pane fix**: `pointerup`/`pointercancel` are bound to `window`, not the pane
  element, with a `blur` listener alongside them. This is a real bug fix, not just plumbing for the
  scheduler: releasing the mouse outside the element it was pressed in is routine (fast drags
  routinely leave the pointer outside the source element), and a release that never reaches the
  pane's own listener left `activePane` set forever — every other viewport then stops redrawing
  until some unrelated store write happens to bump the shared revision, which reads as "the viewer
  randomly stopped updating" with no error anywhere. A drag interrupted by the tab losing focus
  never fires `pointerup` at all, which is what the `blur` listener catches.
- **Staleness safety valve**: `beginFrame` also force-releases `activePane` if
  `INTERACTION_STALE_MS` (3s) has passed since the interaction last touched the scheduler, even
  without a matching `endInteraction()`. Belt-and-braces on top of the window-level fix above — the
  gate should be provably impossible to leave stuck, not just fixed for the one repro that was found.
- **Read imperatively, never through React state**: `RenderScheduler`'s methods are called from
  inside `useFrame`, every frame, and must never themselves trigger a re-render — that would defeat
  the entire point. All of its state (`activePane`, `sharedRevision`, etc.) is plain closure
  variables, not `useState`.

**What ties into it elsewhere:**

- `Viewport2DContent`'s wheel handler batches ticks into one `requestAnimationFrame` flush instead
  of one `setSliceIndex` per wheel event, and treats the scrub as a scheduler interaction that ends
  `SCRUB_IDLE_MS` (150ms) after the wheel goes quiet — see `viewports/Viewport2DContent.tsx` below.
- Each viewport clears only its own scissor rect on the frames it actually draws, rather than relying
  on a full-canvas clear every frame — see `DicomCanvas.tsx`'s `FrameClearer` entry above.

## `viewports/useFirstFrameFlag.ts`

Fires `onFirstFrame` once per `handle` identity, the first time the caller's render path actually
completes — not just when the handle (scene/camera) exists, which only means the data is ready,
not that anything has painted. Shared by `Viewport2DContent`/`Viewport3DContent` since both need
the exact same "fire once per handle" bookkeeping around otherwise-unrelated render bodies (2D's
slice + localizer passes vs. 3D's light-follow/threshold/overlay-hiding logic).

## `viewports/useViewport2D.ts`

- Overlay meshes are tracked per layer id (`overlayMeshesRef`) so they can be swapped when
  geometry rebuilds. `useRef` is correct here — mesh map changes must not trigger re-renders.
- **Controls-before-canvas ordering**: controls MUST be assigned before `camera.canvas` — the
  canvas setter calls `_updateCanvas` → `_updateMatrices` → `this._controls.update()` and
  `this.controls.handleResize()`, both of which crash if `_controls` is null.
- **0×0 pane guard**: a pane can start out hidden (0×0) — e.g. `single_view` mode's inactive panes
  — in which case `fitBox`'s internal `_computeZoom` bails out (`dimension <= 0`) and logs ami.js's
  "Invalid dimension provided." warning for no benefit. `Viewport2DContent`'s resize effect already
  re-fits (via `fitCamera`) once the pane gets a real size.
- **`manual = true`**: prevents React Three Fiber's `View.prepareSkissor` from overwriting ami.js's
  left/right/top/bottom directly — `manual=true` means it only calls `updateProjectionMatrix()`,
  which delegates to ami.js's own implementation.
- **Mesh-rebuild skip (perf fix)**: pure opacity/window-level/LUT edits leave both the geometry
  (unchanged slice) and material (same object, mutated uniforms in place) untouched — skip tearing
  down and recreating the mesh in that case. Without this, every store-level layer edit (dragging
  a slider fires one update per pointer-move) rebuilt the mesh purely to pick up a value that was
  already live via the shared material/uniforms reference.

## `viewports/useViewport3D.ts`

- **Aspect fallback**: aspect 1 is used as a safe default — `Viewport3DContent` corrects it via a
  `useEffect([size, handle])` once the div is laid out. `clientWidth`/`clientHeight` can be 0
  before layout, producing NaN.
- **Camera distance**: camera is positioned at 2× the largest world-space dimension from the
  center, so the stack is always visible regardless of LPS coordinate magnitudes.
- **Wireframe bounding box**: built directly from the world-space AABB (`worldBoundingBox()`
  returns `[xmin,xmax, ymin,ymax, zmin,zmax]` in LPS space) rather than using
  `BoundingBoxHelper`, which internally creates a `Mesh` with null material (can throw in THREE
  r180) and relies on `BoxHelper.setFromObject` on an off-scene `Mesh` whose `matrixWorld` may not
  be up-to-date.

## `viewports/Viewport2DContent.tsx`

- **`id` prop**: the pane's own id (from `PaneDescriptor.id`), distinct from `planeOrientation` —
  used (not `planeOrientation`) when calling `ctx.registerViewportScene`, so two panes sharing an
  orientation don't collide. See `DicomCanvas.tsx`'s "keyed by pane id" entry for the full picture.
- **`layerIds` / `visibleLayers`**: an allowlist filter applied to `ctx.layers` before it's handed
  to `handle.refreshOverlayMeshes`. Omitted `layerIds` means every registered layer, matching the
  original (unfilterable) behavior. There's no per-pane LUT override — a layer's LUT lives on its
  shared material, reused by every pane drawing it — so two panes with different `layerIds` show
  different subsets of layers, not the same layer with different LUTs.
- **`sliceColor` now optional**: defaults to `DEFAULT_SLICE_COLORS[planeOrientation]` (the same
  three colors previously hardcoded in `DicomCanvas.tsx`'s `SLICE_COLORS`) so a `PaneDescriptor`
  can omit it entirely for the common case and only set it to get a non-default crosshair tint.
- **`syncSliceWith` / `sliceKey`**: `const sliceKey = syncSliceWith ?? id` is used everywhere the
  component reads or writes the _current_ slice position (`sliceIndices?.[sliceKey]`, wheel-scroll's
  `ctx.setSliceIndex(sliceKey, next)`, the initial middle-slice seed) — but NOT for
  `setSliceMaxIndex`/`setPlaneStackOrientation`, which stay keyed by `planeOrientation` (see
  `hooks/useDicomViewerStore.ts`'s entry on why those two are different from `sliceIndices`).
  `registerViewportScene` also stays keyed by `id`, never `sliceKey` — scene registration is about
  this specific pane's visual instance, unrelated to which slice-navigation group it's in.
- **ResizeObserver fix**: camera frustum is recalculated whenever the pane's own on-screen size
  changes. A `ResizeObserver` on the tracking div (rather than reacting to R3F's canvas-level
  `size`) is required because a pane can start out hidden (0×0 — e.g. `single_view`'s inactive
  panes) and later become visible from a pure CSS layout change (switching view mode) with no
  window/canvas resize involved — `size` never changes in that case, so the camera would otherwise
  be stuck with the degenerate zero-size frustum it was created with while hidden.
- **Render-scheduler gating**: registers a stable `paneId`, calls `beginInteraction`/`endInteraction`
  around pointer drags, and `useFrame` bails out early (before any scissor/clear/render work) when
  `scheduler.shouldRenderPane(...)` says this frame isn't this pane's turn. See
  `viewports/renderScheduler.ts` for the full mechanism; this is one of its two viewport-side
  integration points (the other is `Viewport3DContent.tsx`).
- **`pointerup`/`pointercancel` on `window`, plus `blur`**: not an arbitrary style choice — releasing
  the mouse outside the pane it was pressed in is routine, and a release that never reaches the
  pane's own element left the scheduler's interaction gate latched on forever, freezing every other
  pane. See the "Release-outside-pane fix" entry under `viewports/renderScheduler.ts`.
- **Wheel-scrub batching**: wheel events fire far faster than frames (a trackpad emits well over
  60/s), and each `setSliceIndex` call used to write the store directly from the handler — one store
  write, and therefore one full re-render cascade through every context consumer, per event. Ticks
  are now accumulated into `pendingDelta` and applied once per `requestAnimationFrame` instead, so a
  fast scroll burst costs one cascade rather than one per tick; the same number of slices is still
  traversed, just coalesced. The scrub is also reported to the render scheduler as an interaction
  (`beginInteraction`) that ends `SCRUB_IDLE_MS` (150ms) after the wheel goes quiet
  (`scheduler.endInteraction()` on a debounced timeout) — a wheel gesture has no natural down/up pair,
  so this timeout is what stands in for one.
- **Own-scissor-rect clear**: clears just this viewport's scissor rect (`gl.clear()` honours the
  active scissor box) immediately before `gl.render()`, rather than relying on a canvas-wide clear —
  see `DicomCanvas.tsx`'s `FrameClearer` entry for why the canvas is no longer wiped every frame.

## `viewports/Viewport3DContent.tsx`

- **Pointer/wheel invalidation**: invalidates from DOM pointer/wheel events so dragging bootstraps
  the render loop before `controls.update()` has a chance to run inside `useFrame`. ami.js's
  `TrackballControl` fires `'change'` from within `update()`, which is called from `useFrame` — so
  listening to `controls` `'change'` doesn't help; the first frame must be triggered from the raw
  DOM events instead.
- **Threshold invalidation timing**: invalidates after React commits a threshold change so
  `useFrame` sees the updated values. `StoreInvalidator` fires before React re-renders (wrong
  timing); `useEffect` fires after commit (correct timing).
- **3D overlay bleed-through fix**: the axial/sagittal/coronal scenes are nested inside the 3D
  scene so their slice planes render there too, but that also drags in anything `DicomOverlay`
  portaled into those 2D scenes, even overlays whose `viewports` prop excludes `"3d"`. Those nested
  copies are hidden for this render only — an overlay that DOES want 3D inclusion already has its
  own dedicated portal directly into the 3D scene (untouched here, since it isn't nested inside one
  of the three 2D scenes).
- **Render-scheduler gating**: same `paneId`/`beginInteraction`/`endInteraction`/`shouldRenderPane`
  pattern as `Viewport2DContent.tsx` (see `viewports/renderScheduler.ts`), plus the same
  window-bound `pointerup`/`pointercancel`/`blur` listeners and own-scissor-rect clear before
  `gl.render()`. Orbiting this viewport touches no shared viewer state, so — unlike a slice scrub —
  it never triggers a sibling redraw; the 2D viewports correctly stay frozen while the 3D view moves.

## `DicomViewer.tsx`

- **`useDicomViewerStable`, not `useDicomViewer`**: this component's own record subscription uses
  the shallow-compared, `sliceIndices`-excluding hook (see `hooks/useDicomViewerStore.ts` above) —
  otherwise every slice scrub would re-render `DicomViewer` itself, rebuild `ctxValue`, and cascade
  into every context consumer for no reason (nothing here reads `sliceIndices` directly).
- **Viewport scene registry**: populated by `Viewport*Content` once they init. `DicomOverlay`
  reads these to portal its children into per-viewport scenes.
- **2D→3D scene wiring**: 2D scenes are wired into the 3D scene so the perspective camera renders
  slice planes. Pattern from `viewers_blend`: `r0.scene.add(pane.scene)`. Each 2D scene contains a
  `StackHelper` (textured slice quad); adding it to the 3D scene makes those planes visible from
  the perspective camera without duplicating any geometry or data.
- **Localizer sync**: an immediate `syncAll()` is forced right after cross-ref init so the
  localizer uniforms reflect the current slice positions — without this the lines wouldn't appear
  until the next user-driven slice navigation event.
- **`handleRenderComplete` replaces the old `handleViewportReady`/`handleViewportFirstFrame` pair**:
  `DicomCanvas` now does all the per-pane readiness bookkeeping itself (see its `checkReady` entry
  above) and calls a single `onRender(viewports, mode)` once per view activation.
  `DicomViewer.tsx` no longer needs its own `vpHandlesRef`/`onRenderFiredRef`/`renderedViewportsRef`/
  `expectedViewportIdsRef` — `handleRenderComplete` just sets `hasRenderedOnce` and forwards the
  call to the consumer's own `onRender` prop, if any.
- **`hasRenderedOnce` tracking**: a stack existing only means the data decoded —
  `StackHelper`/`DataTexture` construction still has to run and a WebGL frame still has to be
  drawn before the user sees anything. Reset to `false` on `[data]` (a new volume starts a new
  "first paint" cycle) and set back to `true` by `handleRenderComplete`.
- **Known trade-off — `hasRenderedOnce` is not reset on mode switch**: the old implementation
  explicitly recomputed "expected panes" on every `viewMode`/`orientation` change and could flip
  `hasRenderedOnce` back to `false` if the newly active set included a pane that hadn't painted yet
  (e.g. `single_view` → `quad_view` exposing three previously-hidden panes). The new design doesn't
  reproduce this: `hasRenderedOnce` only ever goes `false → true`, never back down, so switching to
  a brand-new custom view mode whose panes are still initializing won't re-show the loading
  overlay. In practice this rarely matters for `single_view`/`quad_view` themselves — both declare
  the same four canonical pane ids, and the `markFirstFrame()` timing fix (see `DicomCanvas.tsx`
  above) means all four now become "ready" together shortly after first mount regardless of which
  of the two modes is active first, so there's no meaningful window where switching between them
  needs the overlay back. It does mean a genuinely new custom view (new pane ids, first activation)
  won't get a loading spinner while its panes spin up. Accepted for this first pass rather than
  adding cross-effect ordering to chase exact parity with the old behavior; revisit if a concrete
  case shows the spinner is needed there.
