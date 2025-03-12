import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook to manage wallet connections
 * @returns {Object} Wallet connection state and functions
 */
export const useWallet = () => {
  // State to track connection status
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedIsConnected = localStorage.getItem('isWalletConnected') === 'true';
    if (savedIsConnected) {
      connect();
    }
  }, []);

  /**
   * Check if MetaMask or another Ethereum provider is available
   * @returns {boolean} Whether a provider is available
   */
  const isProviderAvailable = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }, []);

  /**
   * Connect to the wallet
   */
  const connect = useCallback(async () => {
    if (!isProviderAvailable()) {
      setError('No Ethereum wallet detected. Please install MetaMask.');
      return;
    }

    try {
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      // Initialize ethers provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Update state
      setIsConnected(true);
      setAccount(account);
      setChainId(chainId);
      setProvider(provider);
      setSigner(signer);

      // Save connection status
      localStorage.setItem('isWalletConnected', 'true');
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setError(error.message || 'Failed to connect to wallet');
      disconnect();
    }
  }, [isProviderAvailable]);

  /**
   * Disconnect from the wallet
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('isWalletConnected');
  }, []);

  /**
   * Switch to a different network
   * @param {number|string} targetChainId - Chain ID to switch to
   */
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!isConnected || !window.ethereum) {
      setError('Not connected to wallet');
      return;
    }

    try {
      // Convert targetChainId to hex if it's a number
      const chainIdHex = typeof targetChainId === 'number'
        ? `0x${targetChainId.toString(16)}`
        : targetChainId;

      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });

      // Update chain ID after successful switch
      setChainId(parseInt(chainIdHex, 16));
    } catch (error) {
      // If the chain is not added to MetaMask, this will provide instructions
      if (error.code === 4902) {
        setError('This network is not available in your wallet. Please add it first.');
      } else {
        console.error('Error switching network:', error);
        setError(error.message || 'Failed to switch network');
      }
    }
  }, [isConnected]);

  /**
   * Add a network to MetaMask
   * @param {Object} networkParams - Network parameters
   */
  const addNetwork = useCallback(async (networkParams) => {
    if (!isConnected || !window.ethereum) {
      setError('Not connected to wallet');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams]
      });
    } catch (error) {
      console.error('Error adding network:', error);
      setError(error.message || 'Failed to add network');
    }
  }, [isConnected]);

  // Set up event listeners for account and chain changes
  useEffect(() => {
    if (!isProviderAvailable()) {
      return;
    }

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (accounts[0] !== account) {
        // User switched accounts
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      
      // Reload the page as recommended by MetaMask
      window.location.reload();
    };

    // Subscribe to events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, disconnect, isProviderAvailable]);

  return {
    isConnected,
    account,
    chainId,
    provider,
    signer,
    error,
    connect,
    disconnect,
    switchNetwork,
    addNetwork,
    isProviderAvailable
  };
};