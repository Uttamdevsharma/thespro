import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import { apiSlice } from '../features/apiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});