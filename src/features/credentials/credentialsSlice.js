import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  credentials: [],
  selectedCredential: null,
};

export const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.credentials = action.payload;
    },
    addCredential: (state, action) => {
      state.credentials.push(action.payload);
    },
    updateCredential: (state, action) => {
      const { credentialHash, updates } = action.payload;
      const index = state.credentials.findIndex(c => c.credential_hash === credentialHash);
      if (index !== -1) {
        state.credentials[index] = { ...state.credentials[index], ...updates };
      }
    },
    selectCredential: (state, action) => {
      state.selectedCredential = action.payload;
    },
    clearCredentials: (state) => {
      state.credentials = [];
      state.selectedCredential = null;
    },
  },
});

export const { 
  setCredentials, 
  addCredential, 
  updateCredential, 
  selectCredential,
  clearCredentials
} = credentialsSlice.actions;

export default credentialsSlice.reducer;