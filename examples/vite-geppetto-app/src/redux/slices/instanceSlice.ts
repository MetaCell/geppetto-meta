import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Instance {
  id: string;
  color: string;
  opacity: number;
}

export interface InstancesState {
  instances: Instance[];
}

export const initialState: InstancesState = {
  instances: [
    { id: "object_a", color: "#1568D5", opacity: 1 },
    { id: "object_b", color: "#B23AE9", opacity: 0.6 },
  ],
};

const instancesSlice = createSlice({
  name: "instances",
  initialState,
  reducers: {
    updateColor: (state, action: PayloadAction<{ id: string; color: string }>) => {
      const inst = state.instances.find(i => i.id === action.payload.id);
      if (inst) inst.color = action.payload.color;
    },
    updateOpacity: (state, action: PayloadAction<{ id: string; opacity: number }>) => {
      const inst = state.instances.find(i => i.id === action.payload.id);
      if (inst) inst.opacity = action.payload.opacity;
    },
  },
});

export const { updateColor, updateOpacity } = instancesSlice.actions;
export default instancesSlice.reducer;
