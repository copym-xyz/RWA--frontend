import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tokenId: null,
  did: null,
  identity: null,
  chainIdentities: [],
  isLoading: false,
  error: null,
};

export const identitySlice = createSlice({
  name: 'identity',
  initialState,
  reducers: {
    setIdentity: (state, action) => {
      state.identity = action.payload;
      state.tokenId = action.payload.tokenId;
      state.did = action.payload.did;
      state.chainIdentities = action.payload.chainIdentities || [];
    },
    setTokenId: (state, action) => {
      state.tokenId = action.payload;
    },
    setDID: (state, action) => {
      state.did = action.payload;
    },
    setChainIdentities: (state, action) => {
      state.chainIdentities = action.payload;
    },
    addChainIdentity: (state, action) => {
      state.chainIdentities.push(action.payload);
    },
    setIdentityLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIdentityError: (state, action) => {
      state.error = action.payload;
    },
    resetIdentity: (state) => {
      state.tokenId = null;
      state.did = null;
      state.identity = null;
      state.chainIdentities = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setIdentity,
  setTokenId,
  setDID,
  setChainIdentities,
  addChainIdentity,
  setIdentityLoading,
  setIdentityError,
  resetIdentity,
} = identitySlice.actions;

export default identitySlice.reducer;