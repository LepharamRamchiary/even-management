// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import eventReducer from './slices/eventSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    events: eventReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;