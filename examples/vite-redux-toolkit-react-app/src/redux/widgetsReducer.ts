import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Widget } from '@metacell/geppetto-meta-client/common/layout/model';
import { addWidget as add, updateWidget as update } from '@metacell/geppetto-meta-client/common/layout/actions';

interface WidgetsState {
  [id: string]: Widget;
}

const initialState: WidgetsState = {};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Widget>) => {
      add(action.payload);
      state[action.payload.id] = action.payload;
    },
    updateWidget: (state, action: PayloadAction<Widget>) => {
      const widget = action.payload;
      update(widget);
      if (state[widget.id]) {
        state[widget.id] = widget;
      }
    },
  },
});

export const { addWidget, updateWidget } = widgetsSlice.actions;
export default widgetsSlice.reducer;
