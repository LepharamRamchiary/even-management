import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice.js';
import eventReducer from './slices/eventSlice.js';
import uiReducer from './slices/uiSlice.js';

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