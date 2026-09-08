import * as THREE from "three";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  DicomViewerActions,
  DicomViewerState,
  LayerState,
  LayerTransform,
  PlaneOrientation,
} from "../types";
import { centerSlicesOnPoint } from "../utils";

type ViewerRecord = DicomViewerState & DicomViewerActions;

interface DicomViewerStore {
  viewers: Record<string, ViewerRecord>;
  registerViewer: (id: string) => void;
  unregisterViewer: (id: string) => void;
}

const defaultViewerState = (): DicomViewerState => ({
  stack: null,
  viewMode: "quad_view",
  orientation: "3d",
  sliceIndices: { axial: 0, sagittal: 0, coronal: 0 },
  sliceMaxIndices: { axial: 0, sagittal: 0, coronal: 0 },
  planeStackOrientations: { axial: 0, sagittal: 1, coronal: 2 },
  isLoading: false,
  layers: [],
  threshold3D: 0,
  threshold3DEnabled: false,
});

export const useDicomViewerStore = create<DicomViewerStore>((set, get) => ({
  viewers: {},

  registerViewer: (id: string) => {
    set(state => {
      if (state.viewers[id]) return state;

      const updateViewer = (updater: (v: ViewerRecord) => Partial<DicomViewerState>) =>
        set(s => {
          const v = s.viewers[id];
          if (!v) return s;
          return { viewers: { ...s.viewers, [id]: { ...v, ...updater(v) } } };
        });
      const patch = (partial: Partial<DicomViewerState>) => updateViewer(() => partial);

      const actions: DicomViewerActions = {
        setStack: stack => patch({ stack }),
        setViewMode: viewMode => patch({ viewMode }),
        setOrientation: orientation => patch({ orientation }),
        setThreshold3D: threshold3D => patch({ threshold3D }),
        setThreshold3DEnabled: threshold3DEnabled => patch({ threshold3DEnabled }),
        setSliceIndex: (plane: PlaneOrientation, idx: number) =>
          updateViewer(v => ({ sliceIndices: { ...v.sliceIndices, [plane]: idx } })),
        setSliceMaxIndex: (plane: PlaneOrientation, maxIdx: number) =>
          updateViewer(v => ({ sliceMaxIndices: { ...v.sliceMaxIndices, [plane]: maxIdx } })),
        // Bulk setter kept for API compat.
        setSliceMaxIndices: sliceMaxIndices => patch({ sliceMaxIndices }),
        setPlaneStackOrientation: (plane: PlaneOrientation, stackOrientation: number) =>
          updateViewer(v => ({
            planeStackOrientations: { ...v.planeStackOrientations, [plane]: stackOrientation },
          })),
        setLoading: isLoading => patch({ isLoading }),

        centerOnPoint: (point: THREE.Vector3) => {
          const viewer = get().viewers[id];
          if (!viewer) return;
          centerSlicesOnPoint(
            point,
            viewer.stack,
            viewer.sliceMaxIndices,
            viewer.planeStackOrientations,
            viewer.setSliceIndex,
          );
        },

        registerLayer: (layer: LayerState) =>
          updateViewer(v => ({ layers: [...v.layers.filter(l => l.id !== layer.id), layer] })),

        unregisterLayer: (layerId: string) =>
          updateViewer(v => ({ layers: v.layers.filter(l => l.id !== layerId) })),

        setLayerOpacity: (layerId, opacity) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setOpacity(opacity);
          updateViewer(v => ({ layers: [...v.layers] }));
        },
        setLayerTransform: (layerId, transform: LayerTransform) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setTransform(transform);
          updateViewer(v => ({ layers: [...v.layers] }));
        },
        setLayerWindowLevel: (layerId, center, width) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setWindowLevel?.(center, width);
          updateViewer(v => ({ layers: [...v.layers] }));
        },
        setLayerLut: (layerId, name) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setLut?.(name);
          updateViewer(v => ({ layers: [...v.layers] }));
        },
      };

      return {
        viewers: {
          ...state.viewers,
          [id]: { ...defaultViewerState(), ...actions },
        },
      };
    });
  },

  unregisterViewer: (id: string) =>
    set(state => {
      const { [id]: _removed, ...rest } = state.viewers;
      return { viewers: rest };
    }),
}));

/*
 * Subscribing to the whole record re-renders on EVERY patch, including slice scrubbing — the
 * highest-frequency write in the viewer. That re-renders DicomViewer, which rebuilds ctxValue,
 * which re-renders every context consumer (all panes, every overlay), none of which needed to
 * know. Kept for callers that genuinely want everything.
 */
export const useDicomViewer = (id: string): ViewerRecord | null =>
  useDicomViewerStore(s => s.viewers[id] ?? null);

/*
 * The record WITHOUT sliceIndices, shallow-compared. A slice patch produces a new record object but
 * leaves every field here untouched, so the shallow comparison holds and no re-render happens. This
 * is what keeps scrubbing from cascading through the whole subtree.
 */
export const useDicomViewerStable = (id: string): Omit<ViewerRecord, "sliceIndices"> | null =>
  useDicomViewerStore(
    useShallow(s => {
      const viewer = s.viewers[id];
      if (!viewer) return null;
      const { sliceIndices: _sliceIndices, ...rest } = viewer;
      return rest;
    }),
  );

/*
 * Slice positions, for the few components that actually depend on them (the 2D panes and any
 * overlay that filters by proximity to the current slice).
 *
 * Returns the STORED reference, never a constructed object: several call sites put this straight
 * into a dependency array, and a fresh object per store event would re-run those effects on every
 * unrelated patch — worse than the cascade this replaces.
 */
export const useSliceIndices = (
  id: string | undefined,
): Record<PlaneOrientation, number> | undefined =>
  useDicomViewerStore(s => (id ? s.viewers[id]?.sliceIndices : undefined));
