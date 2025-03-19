import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api';
import authReducer from '../features/auth/authSlice';
import identityReducer from '../features/identity/identitySlice';
import credentialsReducer from '../features/credentials/credentialsSlice';
import kycReducer from '../features/kyc/kycSlice';
import bridgeReducer from '../features/bridge/bridgeSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    identity: identityReducer,
    credentials: credentialsReducer,
    kyc: kycReducer,
    bridge: bridgeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for ethers.js objects
    }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);