import type { RootState } from "@react-three/fiber";
import React from "react";
import { create } from "zustand";

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
