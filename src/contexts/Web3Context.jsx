import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAuth } from './AuthContext';

// Contract ABIs
import SoulboundNFTABI from '../contracts/SoulboundNFTABI.json';
import CrossChainBridgeABI from '../contracts/CrossChainBridgeABI.json';

// Create the Web3Context
const Web3Context = createContext();

// Custom hook to use the web3 context
export const useWeb3 = () => {
  return useContext(Web3Context);
};

// Web3Provider component
export const Web3Provider = ({ children }) => {
  const { currentUser, updateUser } = useAuth();
  
  // State for Ethereum connection
  const [ethereumProvider, setEthereumProvider] = useState(null);
  const [ethereumSigner, setEthereumSigner] = useState(null);
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [ethereumChainId, setEthereumChainId] = useState(null);
  const [ethereumConnected, setEthereumConnected] = useState(false);
  
  // State for Solana connection
  const [solanaConnection, setSolanaConnection] = useState(null);
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [solanaAddress, setSolanaAddress] = useState('');
  const [solanaConnected, setSolanaConnected] = useState(false);
  
  // Smart contract instances
  const [soulboundNFTContract, setSoulboundNFTContract] = useState(null);
  const [bridgeContract, setBridgeContract] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Blockchain configurations
  const blockchainConfig = {
    ethereum: {
      mainnet: {
        chainId: '0x1',
        rpcUrl: 'https://mainnet.infura.io/v3/your-infura-key',
        soulboundNFTAddress: '0x...',
        bridgeAddress: '0x...'
      },
      sepolia: {
        chainId: '0xaa36a7',
        rpcUrl: 'https://sepolia.infura.io/v3/your-infura-key',
        soulboundNFTAddress: '0x...',
        bridgeAddress: '0x...'
      }
    },
    solana: {
      mainnet: {
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        programId: '...'
      },
      devnet: {
        rpcUrl: 'https://api.devnet.solana.com',
        programId: '...'
      }
    }
  };
  
  // Initialize connections when component mounts
  useEffect(() => {
    const initializeSolanaConnection = () => {
      // Initialize Solana connection with devnet
      const connection = new Connection(blockchainConfig.solana.devnet.rpcUrl);
      setSolanaConnection(connection);
    };
    
    initializeSolanaConnection();
  }, []);
  
  // Connect to Ethereum
  const connectEthereum = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Get the chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Create an ethers provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      setEthereumProvider(provider);
      setEthereumSigner(signer);
      setEthereumAddress(address);
      setEthereumChainId(chainId);
      setEthereumConnected(true);
      
      // Initialize contracts
      const network = getEthereumNetworkName(chainId);
      if (network) {
        const soulboundNFT = new ethers.Contract(
          blockchainConfig.ethereum[network].soulboundNFTAddress,
          SoulboundNFTABI,
          signer
        );
        
        const bridge = new ethers.Contract(
          blockchainConfig.ethereum[network].bridgeAddress,
          CrossChainBridgeABI,
          signer
        );
        
        setSoulboundNFTContract(soulboundNFT);
        setBridgeContract(bridge);
      }
      
      // Update user in AuthContext if logged in
      if (currentUser) {
        updateUser({ ethereumAddress: address });
      }
      
      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      setLoading(false);
      return address;
    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };
  
  // Connect to Solana
  const connectSolana = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if Phantom wallet is installed
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet is not installed. Please install Phantom to continue.');
      }
      
      // Connect to wallet
      const { publicKey } = await window.solana.connect();
      const address = publicKey.toString();
      
      setSolanaWallet(window.solana);
      setSolanaAddress(address);
      setSolanaConnected(true);
      
      // Update user in AuthContext if logged in
      if (currentUser) {
        updateUser({ solanaAddress: address });
      }
      
      setLoading(false);
      return address;
    } catch (error) {
      console.error('Error connecting to Solana:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };
  
  // Disconnect Ethereum
  const disconnectEthereum = () => {
    setEthereumConnected(false);
    setEthereumAddress('');
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };
  
  // Disconnect Solana
  const disconnectSolana = async () => {
    try {
      if (solanaWallet && solanaWallet.isConnected) {
        await solanaWallet.disconnect();
      }
      
      setSolanaConnected(false);
      setSolanaAddress('');
    } catch (error) {
      console.error('Error disconnecting from Solana:', error);
    }
  };
  
  // Handle Ethereum accounts changed
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectEthereum();
    } else {
      setEthereumAddress(accounts[0]);
      
      // Update user in AuthContext if logged in
      if (currentUser) {
        updateUser({ ethereumAddress: accounts[0] });
      }
    }
  };
  
  // Handle Ethereum chain changed
  const handleChainChanged = (chainId) => {
    setEthereumChainId(chainId);
    
    // Reload the page to avoid stale data
    window.location.reload();
  };
  
  // Switch Ethereum network
  const switchEthereumNetwork = async (network) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      const config = blockchainConfig.ethereum[network];
      
      if (!config) {
        throw new Error(`Network configuration for ${network} not found`);
      }
      
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainId }],
        });
      } catch (switchError) {
        // If the network is not added to MetaMask, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: config.chainId,
                chainName: network === 'mainnet' ? 'Ethereum Mainnet' : 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: [config.rpcUrl],
                blockExplorerUrls: [network === 'mainnet' ? 'https://etherscan.io' : 'https://sepolia.etherscan.io']
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Get Ethereum network name from chain ID
  const getEthereumNetworkName = (chainId) => {
    switch (chainId) {
      case '0x1':
        return 'mainnet';
      case '0xaa36a7':
        return 'sepolia';
      default:
        return null;
    }
  };
  
  // Sign message with Ethereum wallet
  const signMessageWithEthereum = async (message) => {
    try {
      if (!ethereumSigner) {
        throw new Error('Ethereum wallet not connected');
      }
      
      const signature = await ethereumSigner.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message with Ethereum:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Sign message with Solana wallet
  const signMessageWithSolana = async (message) => {
    try {
      if (!solanaWallet || !solanaWallet.isConnected) {
        throw new Error('Solana wallet not connected');
      }
      
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await solanaWallet.signMessage(encodedMessage, 'utf8');
      
      return signature;
    } catch (error) {
      console.error('Error signing message with Solana:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Issue a Soulbound NFT on Ethereum
  const issueSoulboundNFT = async (did, verifiableCredential) => {
    try {
      if (!soulboundNFTContract || !ethereumSigner) {
        throw new Error('Ethereum wallet not connected or contract not initialized');
      }
      
      const tx = await soulboundNFTContract.verifyIdentity(
        await ethereumSigner.getAddress(),
        did,
        verifiableCredential
      );
      
      await tx.wait();
      
      // Get the token ID from the event logs
      const receipt = await ethereumProvider.getTransactionReceipt(tx.hash);
      const identityVerifiedEvent = receipt.logs
        .map(log => {
          try {
            return soulboundNFTContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter(event => event && event.name === 'IdentityVerified');
      
      if (identityVerifiedEvent.length === 0) {
        throw new Error('Failed to find IdentityVerified event');
      }
      
      const tokenId = identityVerifiedEvent[0].args.tokenId.toString();
      return { tokenId, transactionHash: tx.hash };
    } catch (error) {
      console.error('Error issuing Soulbound NFT:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Add chain identity to existing Soulbound NFT
  const addChainIdentity = async (tokenId, chainId, chainAddress) => {
    try {
      if (!soulboundNFTContract) {
        throw new Error('Ethereum wallet not connected or contract not initialized');
      }
      
      const tx = await soulboundNFTContract.addChainIdentity(tokenId, chainId, chainAddress);
      await tx.wait();
      
      return { transactionHash: tx.hash };
    } catch (error) {
      console.error('Error adding chain identity:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Value object to be provided by the context
  const value = {
    // Ethereum state
    ethereumProvider,
    ethereumSigner,
    ethereumAddress,
    ethereumChainId,
    ethereumConnected,
    
    // Solana state
    solanaConnection,
    solanaWallet,
    solanaAddress,
    solanaConnected,
    
    // Contract instances
    soulboundNFTContract,
    bridgeContract,
    
    // Loading and error states
    loading,
    error,
    
    // Connection methods
    connectEthereum,
    connectSolana,
    disconnectEthereum,
    disconnectSolana,
    switchEthereumNetwork,
    
    // Utility methods
    getEthereumNetworkName,
    
    // Transaction methods
    signMessageWithEthereum,
    signMessageWithSolana,
    issueSoulboundNFT,
    addChainIdentity
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};