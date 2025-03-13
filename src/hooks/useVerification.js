// src/hooks/useVerification.js
import { useState, useCallback } from 'react';
import { verificationApi } from '../services/api.service';
import { useWallet } from './useWallet';
import { useToast } from './useToast';

export function useVerification() {
  const { account } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Request a new verification for a given DID
   * @param {string} did - Decentralized Identifier
   * @param {string} [targetChain='polygon-amoy'] - Target blockchain
   * @returns {Promise<Object>} Verification request details
   */
  const requestVerification = useCallback(async (did, targetChain = 'polygon-amoy') => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        did,
        sourceChain: 'polygon-amoy', // Default source chain
        targetChain
      };

      const response = await verificationApi.request(requestData);
      
      toast({
        title: 'Verification Requested',
        description: `Verification request submitted for ${did}`,
        variant: 'success'
      });

      return response.data;
    } catch (err) {
      setError(err);
      toast({
        title: 'Verification Request Failed',
        description: err.message || 'Unable to submit verification request',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, toast]);

  /**
   * Fetch pending verification requests
   * @returns {Promise<Array>} List of pending verification requests
   */
  const getPendingVerifications = useCallback(async () => {
    if (!account) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verificationApi.getPending();
      return response.data || [];
    } catch (err) {
      setError(err);
      toast({
        title: 'Fetch Failed',
        description: 'Unable to retrieve pending verifications',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [account, toast]);

  /**
   * Fetch completed verification requests
   * @returns {Promise<Array>} List of completed verification requests
   */
  const getCompletedVerifications = useCallback(async () => {
    if (!account) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Note: Backend API would need a method to fetch completed verifications
      const response = await verificationApi.getByDID(account);
      return (response.data || [])
        .filter(request => request.status === 'completed');
    } catch (err) {
      setError(err);
      toast({
        title: 'Fetch Failed',
        description: 'Unable to retrieve completed verifications',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [account, toast]);

  /**
   * Complete a verification request (typically for verifiers)
   * @param {string} requestId - ID of the verification request
   * @param {boolean} isVerified - Whether the request is verified
   * @returns {Promise<Object>} Updated verification request
   */
  const completeVerification = useCallback(async (requestId, isVerified) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verificationApi.complete(requestId, {
        isVerified,
        message: isVerified ? 'Verification successful' : 'Verification failed'
      });

      toast({
        title: 'Verification Updated',
        description: isVerified 
          ? 'Verification request approved' 
          : 'Verification request rejected',
        variant: isVerified ? 'success' : 'destructive'
      });

      return response.data;
    } catch (err) {
      setError(err);
      toast({
        title: 'Update Failed',
        description: 'Unable to update verification request',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, toast]);

  return {
    requestVerification,
    getPendingVerifications,
    getCompletedVerifications,
    completeVerification,
    loading,
    error
  };
}