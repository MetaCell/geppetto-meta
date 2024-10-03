import { configureStore } from '@reduxjs/toolkit';
import exampleReducer from './exampleSlice';
import { exampleMiddleware } from './middleware';

const store = configureStore({
  reducer: {
    exampleState: exampleReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(exampleMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
