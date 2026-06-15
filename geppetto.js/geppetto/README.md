# @metacell/geppetto

React component library for neuroscience data visualisation, built by [MetaCell](https://metacell.us).

This package consolidates the previously separate `geppetto-ui`, `geppetto-core`, and `geppetto-client` packages into a single, tree-shakeable TypeScript library targeting React 19, MUI v9, and React Three Fiber v9.

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

## Quick start

```tsx
import { Canvas3D } from '@metacell/geppetto/3d-canvas/Canvas3D';
import { DicomViewer } from '@metacell/geppetto/dicom-viewer/preconf/DicomViewer';
```

All public exports are also available from the package root:

```ts
import { Canvas3D, useFiber, Toolbar3D, DicomViewer } from '@metacell/geppetto';
```

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
