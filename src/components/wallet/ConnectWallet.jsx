import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet, updateChainId, updateAccount, setWalletError } from '../../store/slices/walletSlice';

const ConnectWallet = () => {
  const { isConnected, account, chainId, error } = useSelector((state) => state.wallet);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && window.ethereum !== undefined;

  // Connect wallet handler
  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Get chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      // Dispatch connection action
      dispatch(connectWallet({ account, chainId }));

      // Save connection status
      localStorage.setItem('isWalletConnected', 'true');

      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch(setWalletError(error.message));
      
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet handler
  const handleDisconnect = () => {
    dispatch(disconnectWallet());
    localStorage.removeItem('isWalletConnected');
    
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Set up event listeners
  useEffect(() => {
    if (isMetaMaskInstalled) {
      // Handle account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          dispatch(disconnectWallet());
          localStorage.removeItem('isWalletConnected');
        } else if (accounts[0] !== account) {
          // Account changed
          dispatch(updateAccount(accounts[0]));
        }
      };

      // Handle chain changes
      const handleChainChanged = (chainIdHex) => {
        const newChainId = parseInt(chainIdHex, 16);
        dispatch(updateChainId(newChainId));
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Auto-connect if previously connected
      const isConnected = localStorage.getItem('isWalletConnected') === 'true';
      if (isConnected) {
        handleConnect();
      }

      // Cleanup
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, dispatch, isMetaMaskInstalled]);

  // Display error if any
  useEffect(() => {
    if (error) {
      toast({
        title: "Wallet Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div>
      {isConnected ? (
        <Button onClick={handleDisconnect} variant="outline">
          Disconnect Wallet
        </Button>
      ) : (
        <Button onClick={handleConnect}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;