import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { identityService } from '../services/identity.service';

/**
 * Custom hook to manage identity operations
 * @returns {Object} Identity operation state and functions
 */
export const useIdentity = () => {
  const { signer, chainId } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  /**
   * Verify identity and create a SoulboundNFT
   * @param {Object} params - Identity parameters
   * @param {string} params.entityAddress - Address to verify
   * @param {string} params.did - Decentralized Identifier
   * @param {string} params.vc - Verifiable Credential JSON string
   * @returns {Promise<Object>} Result of verification
   */
  const verifyIdentity = useCallback(async (params) => {
    if (!signer) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await identityService.verifyIdentity(params, signer);
      
      if (result.success) {
        setTokenId(result.tokenId);
        
        // Store token ID in localStorage for convenience
        localStorage.setItem('tokenId', result.tokenId);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to verify identity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  /**
   * Add a chain identity for cross-chain operations
   * @param {Object} params - Chain identity parameters
   * @param {string} params.tokenId - SoulboundNFT token ID
   * @param {string} params.chainId - Target chain ID
   * @param {string} params.chainAddress - Address on target chain
   * @returns {Promise<Object>} Result of adding chain identity
   */
  const addChainIdentity = useCallback(async (params) => {
    if (!signer) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await identityService.addChainIdentity(params, signer);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to add chain identity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  /**
   * Get token information by ID
   * @param {string} tokenId - SoulboundNFT token ID
   * @returns {Promise<Object>} Token information
   */
  const getTokenInfo = useCallback(async (tokenId) => {
    if (!tokenId) {
      if (localStorage.getItem('tokenId')) {
        tokenId = localStorage.getItem('tokenId');
      } else {
        setError('Token ID not provided');
        return { success: false, error: 'Token ID not provided' };
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await identityService.getTokenInfo(tokenId);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to get token information';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request verification across chains
   * @param {Object} params - Verification parameters
   * @param {string} params.did - Decentralized Identifier
   * @param {string} params.targetChain - Target chain ID
   * @returns {Promise<Object>} Verification request result
   */
  const requestCrossChainVerification = useCallback(async (params) => {
    if (!signer) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await identityService.requestCrossChainVerification(params, signer);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to request cross-chain verification';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  return {
    isLoading,
    error,
    tokenId,
    verifyIdentity,
    addChainIdentity,
    getTokenInfo,
    requestCrossChainVerification
  };
};