import type { RootState } from "@react-three/fiber";
import React from "react";
import { create } from "zustand";

/*
 * dicom-viewer's own canvas-id context + per-canvas R3F root-state registry —
 * independent from 3d-canvas's Canvas3D/Toolbar3D versions of the same pattern.
 * They look similar but aren't the same thing: Canvas3D's Canvas3DRootState
 * narrows `controls` to CameraControls for its pan/zoom/rotate toolbar groups,
 * whereas a DicomViewer viewport's controls are ami.js's TrackballControl /
 * TrackballOrthoControl — casting into Canvas3D's type would be a lie. Keeping
 * dicom-viewer self-contained also means this folder doesn't require the
 * sibling 3d-canvas module to exist.
 */
export const CanvasIdContext = React.createContext<string | undefined>(undefined);
export const useCanvasId = () => React.useContext(CanvasIdContext);

export type CanvasRootState = RootState;

type FiberStore = {
  rootStates: Record<string, CanvasRootState | null>;
  setRootState: (id: string, state: CanvasRootState) => void;
  clearRootState: (id: string) => void;
};

export const useFiberStore = create<FiberStore>(set => ({
  rootStates: {},

  setRootState: (id, state) => set(prev => ({ rootStates: { ...prev.rootStates, [id]: state } })),

  clearRootState: id =>
    set(prev => {
      const { [id]: _removed, ...rest } = prev.rootStates;
      return { rootStates: rest };
    }),
}));

export const useFiber = (id: string) => useFiberStore(s => s.rootStates[id] ?? null);
