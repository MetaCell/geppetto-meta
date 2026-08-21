import * as THREE from "three";
import { create } from "zustand";
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

/*
 * One Zustand store for all DicomViewer instances in the page,
 * keyed by the viewer `id` prop — same pattern as useFiberStore in Canvas3D.
 */
export const useDicomViewerStore = create<DicomViewerStore>((set, get) => ({
  viewers: {},

  registerViewer: (id: string) => {
    set(state => {
      if (state.viewers[id]) return state;

      const patch = (partial: Partial<DicomViewerState>) =>
        set(s => ({
          viewers: { ...s.viewers, [id]: { ...s.viewers[id], ...partial } },
        }));

      const actions: DicomViewerActions = {
        setStack: stack => patch({ stack }),
        setViewMode: viewMode => patch({ viewMode }),
        setOrientation: orientation => patch({ orientation }),
        setThreshold3D: threshold3D => patch({ threshold3D }),
        setThreshold3DEnabled: threshold3DEnabled => patch({ threshold3DEnabled }),
        setSliceIndex: (plane: PlaneOrientation, idx: number) =>
          set(s => ({
            viewers: {
              ...s.viewers,
              [id]: {
                ...s.viewers[id],
                sliceIndices: { ...s.viewers[id].sliceIndices, [plane]: idx },
              },
            },
          })),
        /*
         * Per-plane setter — functional update avoids stale-spread races when
         * multiple viewports initialise concurrently.
         */
        setSliceMaxIndex: (plane: PlaneOrientation, maxIdx: number) =>
          set(s => ({
            viewers: {
              ...s.viewers,
              [id]: {
                ...s.viewers[id],
                sliceMaxIndices: { ...s.viewers[id].sliceMaxIndices, [plane]: maxIdx },
              },
            },
          })),
        // Bulk setter kept for API compat.
        setSliceMaxIndices: sliceMaxIndices => patch({ sliceMaxIndices }),
        setPlaneStackOrientation: (plane: PlaneOrientation, stackOrientation: number) =>
          set(s => ({
            viewers: {
              ...s.viewers,
              [id]: {
                ...s.viewers[id],
                planeStackOrientations: {
                  ...s.viewers[id].planeStackOrientations,
                  [plane]: stackOrientation,
                },
              },
            },
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
          set(s => ({
            viewers: {
              ...s.viewers,
              [id]: {
                ...s.viewers[id],
                layers: [...s.viewers[id].layers.filter(l => l.id !== layer.id), layer],
              },
            },
          })),

        unregisterLayer: (layerId: string) =>
          set(s => ({
            viewers: {
              ...s.viewers,
              [id]: {
                ...s.viewers[id],
                layers: s.viewers[id].layers.filter(l => l.id !== layerId),
              },
            },
          })),

        /*
         * These mutate the layer's GPU uniforms imperatively (setOpacity/setTransform/
         * setWindowLevel close over the material's uniforms directly — see
         * createLayerMaterial.ts), so the viewer record itself never changes shape.
         * Bumping both the record's reference AND the `layers` array's own reference
         * (rather than patch({}), which only bumps the record) serves two purposes:
         * the record bump is what makes StoreInvalidator (DicomCanvas.tsx) see a
         * change and invalidate — otherwise these calls are silent no-ops under
         * frameloop="demand" until some unrelated invalidate happens to fire — and
         * the array bump keeps `ctx.layers` itself a fresh reference on every edit,
         * so any consumer that keys off `ctx.layers` by reference (not just by the
         * mutated uniforms inside it) reliably re-evaluates too.
         */
        setLayerOpacity: (layerId, opacity) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setOpacity(opacity);
          patch({ layers: [...get().viewers[id].layers] });
        },
        setLayerTransform: (layerId, transform: LayerTransform) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setTransform(transform);
          patch({ layers: [...get().viewers[id].layers] });
        },
        setLayerWindowLevel: (layerId, center, width) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setWindowLevel?.(center, width);
          patch({ layers: [...get().viewers[id].layers] });
        },
        setLayerLut: (layerId, name) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setLut?.(name);
          patch({ layers: [...get().viewers[id].layers] });
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

export const useDicomViewer = (id: string): ViewerRecord | null =>
  useDicomViewerStore(s => s.viewers[id] ?? null);
