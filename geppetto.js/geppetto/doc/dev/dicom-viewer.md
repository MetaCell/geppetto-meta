# dicom-viewer — developer notes

Deeper rationale, invariants, and verified-against-source facts that used to live as block
comments throughout `src/dicom-viewer/`. Quick one-line markers stayed in the code; anything
longer that explains *why* (not just *what*) was moved here so the source stays readable while
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

## `utils.ts`

- **`VP_ID_MAP`**: canonical viewport ID ↔ orientation mapping, matching `DicomCanvas`'s
  `onViewportReady` call order (0=3d, 1=axial, 2=sagittal, 3=coronal). Shared by `DicomViewer`'s
  mode-driven "expected viewports" bookkeeping and any consumer resolving a `ViewportHandle` by
  plane.
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
  second argument is present).
- **`FpsTracker`**: counts `useFrame` calls (= actual WebGL frames rendered) and reports via
  callback. Must live inside the Canvas so it has access to the R3F render loop. With
  `frameloop="demand"`, `useFrame` stops firing when idle, so it schedules a 600 ms decay timeout
  after each frame — if no new frame arrives in time the counter resets to 0, giving an accurate
  "idle = 0 fps" reading.
- **`FiberRegister`**: registers this `DicomViewer`'s R3F canvas in `dicom-viewer`'s own
  `useFiberStore` so that `DicomViewerButton` (and any component using `useFiber`) can look it up
  by `viewerId`. Mirrors `Canvas3D`'s `FiberBridge` conceptually, but uses an independent store —
  must live inside `<Canvas>` to call `useThree()`.
- **`FrameClearer`**: clears the entire canvas once at the start of each frame (priority -1, runs
  before all viewport renders at priority 1). Without this, old frames bleed through in regions
  not covered by any viewport's `gl.render()` call.
- **Container-ref race fix**: `useState` (not `useRef`) is used so the container div's presence is
  known via React state — R3F's `eventSource` is read once at `<Canvas>` mount, so a plain ref
  object (still null on first render) would hand it a stale/empty `eventSource`. A callback ref
  lets `<Canvas>` mounting be delayed until the container div actually exists in the DOM.
  `pointer-events: none` on the canvas so tracking divs receive mouse/wheel events; R3F listens via
  `eventSource={containerEl}` so raycasting still works.

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

- **ResizeObserver fix**: camera frustum is recalculated whenever the pane's own on-screen size
  changes. A `ResizeObserver` on the tracking div (rather than reacting to R3F's canvas-level
  `size`) is required because a pane can start out hidden (0×0 — e.g. `single_view`'s inactive
  panes) and later become visible from a pure CSS layout change (switching view mode) with no
  window/canvas resize involved — `size` never changes in that case, so the camera would otherwise
  be stuck with the degenerate zero-size frustum it was created with while hidden.

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

## `DicomViewer.tsx`

- **Viewport scene registry**: populated by `Viewport*Content` once they init. `DicomOverlay`
  reads these to portal its children into per-viewport scenes.
- **2D→3D scene wiring**: 2D scenes are wired into the 3D scene so the perspective camera renders
  slice planes. Pattern from `viewers_blend`: `r0.scene.add(pane.scene)`. Each 2D scene contains a
  `StackHelper` (textured slice quad); adding it to the 3D scene makes those planes visible from
  the perspective camera without duplicating any geometry or data.
- **Localizer sync**: an immediate `syncAll()` is forced right after cross-ref init so the
  localizer uniforms reflect the current slice positions — without this the lines wouldn't appear
  until the next user-driven slice navigation event.
- **`onRender` one-shot guard**: `onRenderFiredRef` makes `onRender` fire exactly once per volume
  load. `vpHandlesRef.current` is also reset to `[]` on the same `[data]`-triggered effect: without
  it, a volume reload leaves stale (already-disposed) handles from the previous mount sitting in
  the array, and the very first fresh viewport to report in on the new mount would see the "all 4
  ready" check pass immediately — 1 fresh handle + 3 stale/disposed ones — firing `onRender` once
  with corrupted data before the guard blocks any further (correct) calls.
- **`hasRenderedOnce` tracking**: a stack existing only means the data decoded —
  `StackHelper`/`DataTexture` construction still has to run and a WebGL frame still has to be
  drawn before the user sees anything. `Viewport*Content`'s `useFrame` calls `markFirstFrame()`
  (via `useFirstFrameFlag`) once their render pass actually completes; this tracks that across
  however many viewports are relevant for the current `viewMode`/`orientation`.
- **`hasRenderedOnce` reset on mode switch**: `single_view` only ever renders the active pane, so
  that's all that's waited on. The check is unconditional (not just "set to true"): switching
  `viewMode`/`orientation` can newly expect a pane that hasn't painted yet (e.g.
  `single_view` → `quad_view` exposes three panes that were never rendered while hidden), and
  `hasRenderedOnce` must go back to `false` in that case — not just forward to `true` — or the
  loading overlay stays incorrectly hidden.
