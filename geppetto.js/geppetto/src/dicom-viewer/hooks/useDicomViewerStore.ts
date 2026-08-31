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
        /*
         * Per-plane setter — functional update (via updateViewer) avoids stale-spread
         * races when multiple viewports initialise concurrently.
         */
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

        /*
         * These mutate the layer's GPU uniforms imperatively (setOpacity/setTransform/
         * setWindowLevel close over the material's uniforms directly — see
         * createLayerMaterial.ts), so the viewer record itself never changes shape.
         * Bumping just the viewer record's identity is what tells StoreInvalidator to
         * redraw on frameloop="demand" — but consumers decide whether to rebuild/refresh
         * against the `layers` ARRAY's own identity specifically (see Viewport2DContent's
         * "layers changed" effect), so a plain record-identity bump alone isn't enough:
         * any reader that isn't the one currently driving the edit would never
         * re-evaluate against the new value until something unrelated happened to
         * trigger it. Bump `layers` too so every consumer reliably reacts to every
         * opacity/window-level/LUT/transform edit.
         */
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

export const useDicomViewer = (id: string): ViewerRecord | null =>
  useDicomViewerStore(s => s.viewers[id] ?? null);
