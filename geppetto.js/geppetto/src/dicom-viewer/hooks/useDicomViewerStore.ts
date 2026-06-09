import { create } from "zustand";
import type {
  DicomViewerActions,
  DicomViewerState,
  LayerState,
  LayerTransform,
  PlaneOrientation,
} from "../types";

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
        setLoading: isLoading => patch({ isLoading }),

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

        setLayerOpacity: (layerId, opacity) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setOpacity(opacity);
        },
        setLayerTransform: (layerId, transform: LayerTransform) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setTransform(transform);
        },
        setLayerWindowLevel: (layerId, center, width) => {
          get()
            .viewers[id]?.layers.find(l => l.id === layerId)
            ?.setWindowLevel?.(center, width);
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
