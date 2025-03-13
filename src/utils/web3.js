import { ethers } from 'ethers';
import SoulboundNFTABI from '../utils/abis/SoulboundNFT.json';
import CrossChainBridgeABI from '../utils/abis/CrossChainBridge.json';

const POLYGON_AMOY_RPC_URL = import.meta.env.VITE_POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/0ZMvaBwqV9-86WAO9YpqFyL42495Wbcc';
const SOULBOUND_NFT_ADDRESS = import.meta.env.VITE_SOULBOUND_NFT_ADDRESS || '0x191f43EbBe836241f00B5F01b9fC845469b5A431';
const CROSS_CHAIN_BRIDGE_ADDRESS = import.meta.env.VITE_CROSS_CHAIN_BRIDGE_ADDRESS || '0x1E45C6Efd10ea6c7A1B6e0E86612a92dA9e4ecaC';

// Initialize provider
let provider = null;
let signer = null;
let soulboundContract = null;
let bridgeContract = null;

// Connect to Polygon Amoy network
const connectToPolygonAmoy = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3 provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      
      // Check if connected to Polygon Amoy
      const network = await provider.getNetwork();
      if (network.chainId !== 80002) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13882' }], // 80002 in hex
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x13882',
                    chainName: 'Polygon Amoy Testnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18,
                    },
                    rpcUrls: [POLYGON_AMOY_RPC_URL],
                    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                  },
                ],
              });
            } catch (addError) {
              throw new Error('Could not add Polygon Amoy network');
            }
          } else {
            throw switchError;
          }
        }
        
        // Refresh provider after network switch
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      }
      
      // Fix for ABI issue - ensure we're using the ABI array
      const soulboundABI = SoulboundNFTABI.abi || SoulboundNFTABI;
      const bridgeABI = CrossChainBridgeABI.abi || CrossChainBridgeABI;
      
      // Initialize contracts with proper ABI
      soulboundContract = new ethers.Contract(
        SOULBOUND_NFT_ADDRESS,
        soulboundABI,
        signer
      );
      
      bridgeContract = new ethers.Contract(
        CROSS_CHAIN_BRIDGE_ADDRESS,
        bridgeABI,
        signer
      );
      
      const address = await signer.getAddress();
      return { provider, signer, address, soulboundContract, bridgeContract };
    } catch (error) {
      console.error('Error connecting to Polygon Amoy:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask not installed');
  }
};

// Get read-only provider
const getReadOnlyProvider = () => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);
    
    // Fix for ABI issue - ensure we're using the ABI array
    const soulboundABI = SoulboundNFTABI.abi || SoulboundNFTABI;
    const bridgeABI = CrossChainBridgeABI.abi || CrossChainBridgeABI;
    
    soulboundContract = new ethers.Contract(
      SOULBOUND_NFT_ADDRESS,
      soulboundABI,
      provider
    );
    bridgeContract = new ethers.Contract(
      CROSS_CHAIN_BRIDGE_ADDRESS,
      bridgeABI,
      provider
    );
  }
  
  return { provider, soulboundContract, bridgeContract };
};

// Get connected wallet account
const getConnectedAccount = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting connected account:', error);
      return null;
    }
  }
  return null;
};

// Format Ethereum address for display
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export {
  connectToPolygonAmoy,
  getReadOnlyProvider,
  getConnectedAccount,
  formatAddress,
  SOULBOUND_NFT_ADDRESS,
  CROSS_CHAIN_BRIDGE_ADDRESS,
};