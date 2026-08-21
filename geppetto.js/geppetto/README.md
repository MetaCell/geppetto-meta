# @metacell/geppetto

React component library for neuroscience data visualisation, built by [MetaCell](https://metacell.us).

This package consolidates the previously separate `geppetto-ui`, `geppetto-core`, and `geppetto-client` packages into a single, tree-shakeable TypeScript library targeting React 19, MUI v9, and React Three Fiber v9.

**ESM only.** This package ships ES modules exclusively — there is no CommonJS build. Requires Node ≥18, or a bundler/runtime with native ESM support (Vite, current Webpack, current Jest with ESM enabled, etc.). A plain `require('@metacell/geppetto')` will not work.

## Modules

| Module | Description | Docs |
|---|---|---|
| `3d-canvas` | R3F-based 3D canvas with camera controls, demand rendering, and a toolbar system | [README](src/3d-canvas/README.md) |
| `dicom-viewer` | Quad-viewport DICOM/NIfTI/NRRD viewer built on AMI.js and R3F | [README](src/dicom-viewer/README.md) |
| `layout` | Dockable panel layout manager built on FlexLayout-React and Redux Toolkit | — |

## Installation in a project

```bash
# peer dependencies
yarn add react react-dom three @react-three/fiber @react-three/drei @mui/material flexlayout-react ami.js

# package (not yet on npm — use yalc for local development)
yalc add @metacell/geppetto
```

`react`/`react-dom` must satisfy `>=19.0.0 <19.3.0` — this is `@react-three/fiber`'s own peer constraint, not an arbitrary choice on our side; a newer React 19.x that fiber doesn't yet support will fail to resolve. `zustand` is used internally (state stores for `dicom-viewer` and `3d-canvas`) but intentionally isn't declared as our own dependency — `@react-three/fiber` already depends on it directly, so it's guaranteed to be present via that peer.

## Quick start

```tsx
import { Canvas3D } from '@metacell/geppetto/3d-canvas/Canvas3D';
import { DicomViewer } from '@metacell/geppetto/dicom-viewer/preconf/DicomViewer';
```

All public exports are also available from the package root:

```ts
import { Canvas3D, useFiber, Toolbar3D, DicomViewer } from '@metacell/geppetto';
```

### Deep imports are a curated, stable list

`exports` in `package.json` is an explicit list of subpaths — `.`, `./3d-canvas`, `./3d-canvas/Canvas3D`, `./3d-canvas/toolbar/Toolbar3D`, `./dicom-viewer`, `./dicom-viewer/DicomViewer`, `./dicom-viewer/preconf/DicomViewer`, `./layout`, `./layout/styles/*.css` — not a blanket `./*` wildcard over `dist/`. Anything not in that list (individual hooks, viewport internals, toolbar button groups, etc.) is intentionally *not* importable by path; consume it through one of the module barrels (`@metacell/geppetto/3d-canvas`, `@metacell/geppetto/dicom-viewer`, `@metacell/geppetto/layout`) or the package root instead.

This is deliberate: every subpath here becomes part of the public semver contract once this ships on npm, so the list only contains paths that are both genuinely meant as entry points *and* verified to physically exist in the Rollup `preserveModules` output — a pure re-export barrel with no consumers elsewhere in the bundle graph (e.g. `3d-canvas/toolbar/groups/index.ts`) can get inlined away by Rollup and simply not exist as its own file, even though its named exports are still reachable through whatever re-exports it (`@metacell/geppetto/3d-canvas`, in that case). If you need a new subpath added, add it to `exports` **and** confirm with `import.meta.resolve()` (or an actual consumer build) that the target file is really emitted, not just add the path and assume.

## Local development

The package uses [yalc](https://github.com/wclr/yalc) for local linking. From `geppetto.js/geppetto/`:

```bash
yarn install
yarn build          # production build
yarn build:dev      # dev build with source maps
yarn watch          # watch + rebuild + yalc push on change
yarn publish:yalc   # publish to local yalc store
```

## Tech stack

| Concern | Library |
|---|---|
| Rendering | React Three Fiber v9 + Three.js ≥ 0.180 |
| Medical imaging | AMI.js ≥ 0.33.0 (MetaCell fork) |
| Camera controls | `@react-three/drei` CameraControls |
| UI components | MUI v9 |
| Layout | FlexLayout-React + Redux Toolkit v2 |
| State | Zustand v5 (via R3F) |
| Build | Vite 8 library mode (`preserveModules`) |
| Types | TypeScript 6 |
