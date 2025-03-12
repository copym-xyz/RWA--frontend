import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  account: null,
  chainId: null,
  isLoading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (state, action) => {
      state.isConnected = true;
      state.account = action.payload.account;
      state.chainId = action.payload.chainId;
    },
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.account = null;
      state.chainId = null;
    },
    updateChainId: (state, action) => {
      state.chainId = action.payload;
    },
    updateAccount: (state, action) => {
      state.account = action.payload;
    },
    setWalletLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setWalletError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  connectWallet,
  disconnectWallet,
  updateChainId,
  updateAccount,
  setWalletLoading,
  setWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;