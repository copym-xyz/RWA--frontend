import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  supportedChains: {
    1: {
      name: 'Ethereum Mainnet',
      shortName: 'eth-mainnet',
      rpcUrl: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
      explorer: 'https://etherscan.io',
    },
    5: {
      name: 'Ethereum Goerli',
      shortName: 'eth-goerli',
      rpcUrl: `https://goerli.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
      explorer: 'https://goerli.etherscan.io',
    },
    11155111: {
      name: 'Ethereum Sepolia',
      shortName: 'eth-sepolia',
      rpcUrl: `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
      explorer: 'https://sepolia.etherscan.io',
    },
    137: {
      name: 'Polygon Mainnet',
      shortName: 'polygon-mainnet',
      rpcUrl: `https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
      explorer: 'https://polygonscan.com',
    },
    80001: {
      name: 'Polygon Mumbai',
      shortName: 'polygon-mumbai',
      rpcUrl: `https://polygon-mumbai.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
      explorer: 'https://mumbai.polygonscan.com',
    },
    80002: {
      name: 'Polygon Amoy',
      shortName: 'polygon-amoy',
      rpcUrl: 'https://rpc-amoy.polygon.technology/',
      explorer: 'https://www.oklink.com/amoy',
    },
  },
  contractAddresses: {
    // These will be loaded from environment variables
    SoulboundNFT: {
      1: import.meta.env.VITE_MAINNET_SOULBOUND_NFT_ADDRESS,
      5: import.meta.env.VITE_GOERLI_SOULBOUND_NFT_ADDRESS,
      11155111: import.meta.env.VITE_SEPOLIA_SOULBOUND_NFT_ADDRESS,
      137: import.meta.env.VITE_POLYGON_SOULBOUND_NFT_ADDRESS,
      80001: import.meta.env.VITE_MUMBAI_SOULBOUND_NFT_ADDRESS,
      80002: import.meta.env.VITE_AMOY_SOULBOUND_NFT_ADDRESS,
    },
    CrossChainBridge: {
      1: import.meta.env.VITE_MAINNET_CROSS_CHAIN_BRIDGE_ADDRESS,
      5: import.meta.env.VITE_GOERLI_CROSS_CHAIN_BRIDGE_ADDRESS,
      11155111: import.meta.env.VITE_SEPOLIA_CROSS_CHAIN_BRIDGE_ADDRESS,
      137: import.meta.env.VITE_POLYGON_CROSS_CHAIN_BRIDGE_ADDRESS,
      80001: import.meta.env.VITE_MUMBAI_CROSS_CHAIN_BRIDGE_ADDRESS,
      80002: import.meta.env.VITE_AMOY_CROSS_CHAIN_BRIDGE_ADDRESS,
    },
  },
};

export const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    updateContractAddresses: (state, action) => {
      state.contractAddresses = {
        ...state.contractAddresses,
        ...action.payload,
      };
    },
    addSupportedChain: (state, action) => {
      const { chainId, chainData } = action.payload;
      state.supportedChains[chainId] = chainData;
    },
  },
});

export const { updateContractAddresses, addSupportedChain } = chainSlice.actions;

export default chainSlice.reducer;