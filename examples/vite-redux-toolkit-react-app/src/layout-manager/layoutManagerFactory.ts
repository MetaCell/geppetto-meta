import { initLayoutManager } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import type { WidgetMap } from "@metacell/geppetto-meta-client/common/layout/model";
import geppettoClientReducer, { clientInitialState, type ClientState } from "@metacell/geppetto-meta-client/common/reducer/geppettoClient";
import { type LayoutState, layout, layoutInitialState, widgets } from "@metacell/geppetto-meta-client/common/reducer/geppettoLayout";
import { reducerDecorator } from "@metacell/geppetto-meta-client/common/reducer/reducerDecorator";
import { createSlice, configureStore, combineReducers, type PayloadAction } from "@reduxjs/toolkit";

import defaultLayout from "../layout/defaultLayout.ts";
import componentMap from "../layout/componentsMap.tsx";

export interface RootState {
  client: ClientState;
  layout: LayoutState;
  widgets: WidgetMap;
  workspaceId: string;
}

// Define a slice for the workspaceId
const workspaceSlice = createSlice({
  name: "workspace",
  initialState: "",
  reducers: {
    setWorkspaceId: (_, action: PayloadAction<string>) => action.payload,
  },
});

export const { setWorkspaceId } = workspaceSlice.actions;

const initialState: RootState = {
  client: clientInitialState,
  layout: layoutInitialState,
  widgets: {},
  workspaceId: "",
};

const rootReducer = reducerDecorator(
  combineReducers<RootState>({
    client: geppettoClientReducer,
    layout,
    widgets,
    workspaceId: workspaceSlice.reducer,
  })
);

const getLayoutManagerAndStore = (workspaceId: string) => {
  const layoutManager = initLayoutManager(defaultLayout, componentMap, undefined, false);
  
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: { ...initialState, workspaceId },
  });
  
  return {
    layoutManager,
    store,
  };
};

export default getLayoutManagerAndStore;
