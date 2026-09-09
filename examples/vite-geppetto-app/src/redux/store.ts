import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  initLayoutManager,
  registerStoreLayout,
  layout,
  widgets,
  layoutInitialState,
} from "@metacell/geppetto";
import instancesReducer, {
  type InstancesState,
  initialState as instancesInitialState,
} from "./slices/instanceSlice";
import baseLayout from "../layoutManager/defaultLayout";
import componentMap from "../layoutManager/componentsMap";

const layoutManager = initLayoutManager(
  baseLayout,
  componentMap,
  null, // no custom TabsetIconFactory
  true, // isMinimizeEnabled
);

export const store = configureStore({
  reducer: {
    layout,
    widgets,
    instances: instancesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      /*
       * FlexLayout model objects are non-serializable (class instances with
       * methods).  Disable the check so RTK doesn't warn on every layout action.
       */
      serializableCheck: false,
    }).concat(layoutManager.middleware as any),
  preloadedState: {
    layout: layoutInitialState as any,
    widgets: {},
    instances: instancesInitialState,
  },
});

registerStoreLayout(store, layoutManager);

/*
 * RTK v2 / React-Redux v9 recommended pattern: export typed hooks so
 * components don't need to repeat the generic type arguments everywhere.
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);

export default store;
