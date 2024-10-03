import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  instances: [],
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    addDataToCanvas(state, action) {
      state.instances.push(action.payload.instance);
    },
    changeInstanceColor(state, action) {
      const { instance, color } = action.payload;
      const instanceToUpdate = state.instances.find(
        (inst) => inst.instancePath === instance.instance
      );
      if (instanceToUpdate) {
        instanceToUpdate.color = color;
      }
    },
  },
});

export const { addDataToCanvas, changeInstanceColor } = exampleSlice.actions;
export default exampleSlice.reducer;
