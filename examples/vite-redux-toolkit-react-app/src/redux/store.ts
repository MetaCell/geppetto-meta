import { configureStore } from '@reduxjs/toolkit';
import widgetsReducer from './widgetsReducer.ts';

const store = configureStore({
  reducer: {
    widgets: widgetsReducer,
  },
  // Use the default middleware
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
// @ts-ignore
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export default store;
