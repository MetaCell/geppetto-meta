import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Instance {
  id: string;
  url: string;
  color: string;
  opacity: number;
}

export interface InstancesState {
  instances: Instance[];
}

export const initialState: InstancesState = {
  instances: [
    {
      id: 'nerve_ring',
      url: 'nervering-SEM_adult.stl',
      color: '#000',
      opacity: 0.5
    },
    {
      id: 'adal_sem',
      url: 'ADAL-SEM_adult.stl',
      color: '#000',
      opacity: 1
    }
  ],
};

const instancesSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    updateColor: (state, action: PayloadAction<{ id: string; color: string }>) => {
      const instance = state?.instances?.find((inst) => inst.id === action.payload.id);
      if (instance) {
        instance.color = action.payload.color;
      }
    },
  },
});

export const { updateColor } = instancesSlice.actions;
export default instancesSlice.reducer;
