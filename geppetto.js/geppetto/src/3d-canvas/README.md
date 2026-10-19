# Canvas3D Documentation

This directory contains two canvas implementations. `Canvas3D` (in `Canvas3D.tsx`) is the current component, built on React Three Fiber (R3F) and recommended for all new work. `Canvas` (in `Canvas.js`) is the legacy imperative component kept for backward compatibility.

## Canvas3D

`Canvas3D` is a thin, opinionated wrapper around [`@react-three/fiber`](https://r3f.docs.pmnd.rs/) `<Canvas>` that adds:

- **Demand rendering** — `frameloop="demand"` by default, so WebGL frames are only drawn when state actually changes.
- **Default lighting** — an `<ambientLight intensity={0.5}>` and a `<directionalLight>` are added automatically.
- **Camera controls** — `<CameraControls>` from `@react-three/drei` is mounted by default and exposed as `fiber.controls` (typed as `CameraControls`).
- **Fiber store registration** — a `FiberBridge` component runs inside the canvas and writes the R3F `RootState` into a global zustand store keyed by the canvas `id`. This is what makes `useFiber()` and `Toolbar3DButton` work outside the R3F tree.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `"default"` | Unique identifier for this canvas. Used as the key in `useFiberStore` and in `CanvasIdContext` for toolbar wiring. |
| `defaultLightOff` | `boolean` | `false` | Suppress the default ambient + directional lights. |
| `nonInteractive` | `boolean` | `false` | Disable the default `<CameraControls>`. Useful when you manage the camera yourself. |
| `controlsOption` | `CameraControlsProps` | — | Props forwarded to the `<CameraControls>` instance (e.g. `minDistance`, `maxPolarAngle`). |
| `...canvasProps` | `CanvasProps` | — | All remaining props are forwarded verbatim to the R3F `<Canvas>`. |

`Canvas3D` is a `forwardRef` component — the ref is forwarded to the underlying `<canvas>` DOM element.

### Basic usage

```tsx
import { Canvas3D } from '@metacell/geppetto/3d-canvas/Canvas3D';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function MyScene() {
  const gltf = useLoader(GLTFLoader, '/model.gltf');
  return <primitive object={gltf.scene} />;
}

function App() {
  return (
    <Canvas3D id="main">
      <MyScene />
    </Canvas3D>
  );
}
```

### Multiple instances

Each canvas must have a unique `id` so the toolbar and `useFiber` can distinguish them:

```tsx
<Canvas3D id="left-canvas">
  <LeftScene />
</Canvas3D>

<Canvas3D id="right-canvas">
  <RightScene />
</Canvas3D>
```

## Accessing canvas state from outside the R3F tree

### `useFiber(id)`

```ts
import { useFiber } from '@metacell/geppetto/3d-canvas/Canvas3D';

const fiber = useFiber('main');
// fiber is Canvas3DRootState | null
// null only before the canvas has mounted
```

Returns the `Canvas3DRootState` for the canvas with the given `id`. `Canvas3DRootState` is the R3F `RootState` with `controls` typed as `CameraControls`:

```ts
type Canvas3DRootState = Omit<RootState, 'controls'> & {
  controls: CameraControls;
};
```

The most commonly used fields:

| Field | Type | What it is |
|---|---|---|
| `fiber.camera` | `THREE.Camera` | The active camera |
| `fiber.controls` | `CameraControls` | The drei CameraControls instance |
| `fiber.scene` | `THREE.Scene` | The root scene |
| `fiber.gl` | `THREE.WebGLRenderer` | The WebGL renderer |
| `fiber.invalidate()` | `() => void` | Request a new frame (demand mode) |
| `fiber.size` | `{ width, height }` | Canvas dimensions in pixels |

### `useFiberStore`

The underlying zustand store. Useful when you need to subscribe imperatively rather than via a hook:

```ts
import { useFiberStore } from '@metacell/geppetto/3d-canvas/Canvas3D';

// Snapshot read (outside React)
const fiber = useFiberStore.getState().rootStates['main'];

// Subscribe imperatively
const unsub = useFiberStore.subscribe(state => {
  console.log('canvas states changed', state.rootStates);
});
```

## Loading 3D assets — `useParallelLoader`

A Suspense-compatible hook that loads multiple URLs in parallel with any Three.js `Loader`.

```ts
import { useParallelLoader } from '@metacell/geppetto/3d-canvas/Canvas3D';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// Inside a component wrapped in <Suspense>:
const objects = useParallelLoader(
  STLLoader,
  ['/mesh1.stl', '/mesh2.stl'],
  loader => { loader.setPath('/assets/'); }, // optional loaderInit
  {
    onFinish: url => console.log('loaded', url),
    onError:  (url, err) => console.error(url, err),
    onProgress: (url, event) => console.log(url, event.loaded),
  }
);
// objects: { '/mesh1.stl': BufferGeometry, '/mesh2.stl': BufferGeometry }
```

- While loading, the hook throws a promise — wrap the consumer in `<Suspense fallback={…}>`.
- Failed URLs are omitted from the result map; loading continues for the remaining URLs.
- When the `urls` array changes, the previous result is cleared and a fresh load starts.

## Toolbar system

The toolbar is built around a context-passing pattern: `Toolbar3D` provides `CanvasIdContext`, and `Toolbar3DButton` reads it to look up the live fiber state when a button is clicked.

### `Toolbar3D`

Container component. Renders a vertical MUI `Box` and provides `CanvasIdContext` to all descendants.

```tsx
import { Toolbar3D } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

<Toolbar3D canvasId="main" sx={{ position: 'absolute', top: 8, right: 8 }}>
  {/* buttons go here */}
</Toolbar3D>
```

| Prop | Type | Description |
|---|---|---|
| `canvasId` | `string?` | The `id` of the `<Canvas3D>` this toolbar controls. Omitting it falls back to the `"default"` canvas. |
| `sx` | `SxProps<Theme>` | MUI sx prop for layout overrides. |
| `children` | `ReactNode` | Buttons, separators, groups. |

### `Toolbar3DButton`

A button that receives the live `Canvas3DRootState` in its `onClick` callback. The fiber is resolved at click time, not at render time.

```tsx
import { Toolbar3DButton } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

<Toolbar3DButton
  icon={<i className="fas fa-home" />}
  tooltip="Reset camera"
  onClick={fiber => fiber.controls.reset(true)}
  active={false}
/>
```

| Prop | Type | Description |
|---|---|---|
| `icon` | `ReactNode` | Icon element displayed inside the button. |
| `tooltip` | `string` | Native `title` attribute (shown on hover). |
| `onClick` | `(fiber: Canvas3DRootState) => void` | Called with the live fiber state. Only fires when the fiber is ready. |
| `active` | `boolean` | When `true`, the button renders with a highlighted (blue) background. |
| `style` | `CSSProperties` | Inline style overrides. |

### `Toolbar3DSeparator`

A thin MUI `Divider` for visual grouping of buttons.

```tsx
import { Toolbar3DSeparator } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

<Toolbar3DSeparator />                      // horizontal (default)
<Toolbar3DSeparator variant="vertical" />   // vertical
```

### `CanvasIdContext` and `useCanvasId`

Both are exported so you can build components that participate in the same context chain without using `Toolbar3DButton` directly:

```tsx
import { CanvasIdContext, useCanvasId } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';

// Provide the context yourself (e.g. from a viewer component):
<CanvasIdContext.Provider value={viewerId}>
  {children}
</CanvasIdContext.Provider>

// Read it in a custom button:
const canvasId = useCanvasId();
const fiber = useFiber(canvasId ?? 'default');
```

This is how `DicomViewer` integrates: it provides `CanvasIdContext` with its own `id`, so `Toolbar3DButton` can find the DICOM canvas in the same store as any `Canvas3D`.

## Built-in toolbar groups

Pre-assembled button groups are available from `toolbar/groups/`. All groups must be rendered inside a `<Toolbar3D canvasId={…}>`.

### `Navigation3D` — pan controls

```tsx
import { Navigation3D } from '@metacell/geppetto/3d-canvas';

<Navigation3D panOptions={{ distance: 0.5, useTransition: true }} />
```

Renders four buttons: Pan Left, Pan Right, Pan Up, Pan Down. Uses `controls.truck()` when CameraControls is available, falls back to direct camera position manipulation.

| Option | Default | Description |
|---|---|---|
| `distance` | `0.5` | Units to pan per click. |
| `useTransition` | `true` | Animate the pan with a smooth transition. |

Individual pan buttons (`PanLeft3D`, `PanRight3D`) are also exported for use without the group wrapper.

### `Zoom3DButtons` — FOV zoom

```tsx
import { Zoom3DButtons } from '@metacell/geppetto/3d-canvas';

<Zoom3DButtons />
```

Two buttons: Zoom In and Zoom Out. Adjusts `camera.fov` on `PerspectiveCamera` (or `camera.zoom` on `OrthographicCamera`).

### `EnhancedZoom3DButtons` — FOV zoom + dolly

```tsx
import { EnhancedZoom3DButtons } from '@metacell/geppetto/3d-canvas';

<EnhancedZoom3DButtons zoomOptions={{ fovStep: 5, minFov: 10, maxFov: 120, dollyStep: 0.5 }} />
```

Four buttons: FOV Zoom In, FOV Zoom Out, Dolly In (moves camera closer via `controls.dolly()`), Dolly Out. Only supports `PerspectiveCamera` for FOV zoom; dolly requires CameraControls.

| Option | Default | Description |
|---|---|---|
| `fovStep` | `5` | Degrees of FOV change per click. |
| `minFov` | `10` | Minimum allowed FOV. |
| `maxFov` | `120` | Maximum allowed FOV. |
| `dollyStep` | `0.5` | Distance for dolly per click. |

### `Animation3DControls` — rotation and auto-rotation

```tsx
import { Animation3DControls } from '@metacell/geppetto/3d-canvas';

<Animation3DControls rotationOptions={{ rotationSpeed: 0.5, manualStep: 0.2, cameraStep: 0.1 }} />
```

Seven buttons: Play (auto-rotate), Pause, Stop (resets camera), Rotate Left, Rotate Right, Rotate Up, Rotate Down. Auto-rotation uses `requestAnimationFrame` and drives `controls.rotateTo()`. Manual rotation uses `controls.rotateTo()` / `controls.rotate()` when available, or direct camera matrix manipulation as fallback.

| Option | Default | Description |
|---|---|---|
| `rotationSpeed` | `0.5` | Radians/second for auto-rotation. |
| `manualStep` | `0.2` | Radians per click for manual rotation. |
| `cameraStep` | `0.1` | Scale factor for fallback camera manipulation. |

### Complete toolbar example

```tsx
import { Canvas3D } from '@metacell/geppetto/3d-canvas/Canvas3D';
import { Toolbar3D, Toolbar3DButton, Toolbar3DSeparator } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';
import { Navigation3D, EnhancedZoom3DButtons, Animation3DControls } from '@metacell/geppetto/3d-canvas';

function Viewer() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <Canvas3D id="viewer">
        <MyScene />
      </Canvas3D>

      <Toolbar3D
        canvasId="viewer"
        sx={{ position: 'absolute', top: 8, right: 8, borderRadius: 1, boxShadow: 1 }}
      >
        <Navigation3D />
        <Toolbar3DSeparator />
        <EnhancedZoom3DButtons />
        <Toolbar3DSeparator />
        <Animation3DControls />
        <Toolbar3DSeparator />
        <Toolbar3DButton
          icon={<i className="fas fa-crosshairs" />}
          tooltip="Focus on origin"
          onClick={fiber => fiber.controls.setTarget(0, 0, 0, true)}
        />
      </Toolbar3D>
    </div>
  );
}
```

## Writing a custom toolbar button

Any component rendered inside `<Toolbar3D canvasId={…}>` (or under any `CanvasIdContext.Provider`) can call `useFiber` to access the canvas:

```tsx
import { useCanvasId } from '@metacell/geppetto/3d-canvas/toolbar/Toolbar3D';
import { useFiber } from '@metacell/geppetto/3d-canvas/Canvas3D';

function WireframeToggle() {
  const [on, setOn] = React.useState(false);
  const canvasId = useCanvasId();
  const fiber = useFiber(canvasId ?? 'default');

  const toggle = () => {
    if (!fiber) { return; }
    fiber.scene.traverse(obj => {
      if (obj.isMesh) { obj.material.wireframe = !on; }
    });
    fiber.invalidate();
    setOn(v => !v);
  };

  return (
    <button onClick={toggle} title="Toggle wireframe" style={{ /* … */ }}>
      <i className={on ? 'fas fa-border-all' : 'fas fa-cube'} />
    </button>
  );
}
```

Or use `Toolbar3DButton` directly and let it handle the fiber lookup:

```tsx
<Toolbar3DButton
  icon={<i className="fas fa-expand" />}
  tooltip="Fit to view"
  onClick={fiber => fiber.controls.fitToSphere(myMesh, true)}
/>
```
