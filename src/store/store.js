import { configureStore } from '@reduxjs/toolkit';
import identityReducer from './slices/identitySlice';
import walletReducer from './slices/walletSlice';
import chainReducer from './slices/chainSlice';

export const store = configureStore({
  reducer: {
    identity: identityReducer,
    wallet: walletReducer,
    chain: chainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});