// Application configuration

// API base URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Supported blockchains
export const SUPPORTED_BLOCKCHAINS = ['ethereum', 'solana', 'polygon'];

// Blockchain network configurations
export const BLOCKCHAIN_CONFIG = {
  ethereum: {
    name: 'Ethereum',
    logo: '/images/ethereum-logo.svg',
    color: '#627EEA',
    testnet: 'Sepolia',
    explorer: {
      mainnet: 'https://etherscan.io',
      testnet: 'https://sepolia.etherscan.io'
    },
    contracts: {
      mainnet: {
        soulboundNFT: 'TODO_MAINNET_SOULBOUND_ADDRESS',
        bridge: 'TODO_MAINNET_BRIDGE_ADDRESS',
      },
      testnet: {
        soulboundNFT: 'TODO_TESTNET_SOULBOUND_ADDRESS',
        bridge: 'TODO_TESTNET_BRIDGE_ADDRESS',
      }
    }
  },
  solana: {
    name: 'Solana',
    logo: '/images/solana-logo.svg',
    color: '#14F195',
    testnet: 'Devnet',
    explorer: {
      mainnet: 'https://explorer.solana.com',
      testnet: 'https://explorer.solana.com/?cluster=devnet'
    },
    programs: {
      mainnet: {
        identity: 'TODO_MAINNET_IDENTITY_PROGRAM_ID',
      },
      testnet: {
        identity: 'TODO_TESTNET_IDENTITY_PROGRAM_ID',
      }
    }
  },
  polygon: {
    name: 'Polygon',
    logo: '/images/polygon-logo.svg',
    color: '#8247E5',
    testnet: 'Mumbai',
    explorer: {
      mainnet: 'https://polygonscan.com',
      testnet: 'https://mumbai.polygonscan.com'
    },
    contracts: {
      mainnet: {
        soulboundNFT: 'TODO_MAINNET_SOULBOUND_ADDRESS',
        bridge: 'TODO_MAINNET_BRIDGE_ADDRESS',
      },
      testnet: {
        soulboundNFT: 'TODO_TESTNET_SOULBOUND_ADDRESS',
        bridge: 'TODO_TESTNET_BRIDGE_ADDRESS',
      }
    }
  }
};

// Feature flags
export const FEATURES = {
  solanaEnabled: true,
  polygonEnabled: false, // Disabled for Phase 1
  kybEnabled: true,
  bridgeEnabled: true,
};

// Application settings
export const APP_SETTINGS = {
  appName: 'Multi-Chain Identity Platform',
  appDescription: 'Decentralized identity management across multiple blockchains',
  contactEmail: 'support@example.com',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  twitterUrl: 'https://twitter.com/example',
  githubUrl: 'https://github.com/example/multi-chain-identity',
  docsUrl: '/docs',
};