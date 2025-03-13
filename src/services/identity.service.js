import { ethers } from 'ethers';
// In identity.service.js, line 2
import { apiClient as apiService } from './api.service';
import SoulboundNFTAbi from '../utils/abis/SoulboundNFT.json';
import CrossChainBridgeAbi from '../utils/abis/CrossChainBridge.json';

/**
 * Service for identity operations
 */
class IdentityService {
  constructor() {
    // Contract addresses - these should be loaded from environment or config
    this.contractAddresses = {
      soulboundNFT: import.meta.env.VITE_SOULBOUND_NFT_ADDRESS,
      crossChainBridge: import.meta.env.VITE_CROSS_CHAIN_BRIDGE_ADDRESS
    };
  }

  /**
   * Get SoulboundNFT contract instance
   * @param {ethers.Signer} signer - Ethers signer
   * @returns {ethers.Contract} Contract instance
   */
  getSoulboundNFTContract(signer) {
    if (!this.contractAddresses.soulboundNFT) {
      throw new Error('SoulboundNFT contract address not configured');
    }
    
    return new ethers.Contract(
      this.contractAddresses.soulboundNFT,
      SoulboundNFTAbi,
      signer
    );
  }

  /**
   * Get CrossChainBridge contract instance
   * @param {ethers.Signer} signer - Ethers signer
   * @returns {ethers.Contract} Contract instance
   */
  getCrossChainBridgeContract(signer) {
    if (!this.contractAddresses.crossChainBridge) {
      throw new Error('CrossChainBridge contract address not configured');
    }
    
    return new ethers.Contract(
      this.contractAddresses.crossChainBridge,
      CrossChainBridgeAbi,
      signer
    );
  }

  /**
   * Verify identity and create a SoulboundNFT
   * @param {Object} params - Identity parameters
   * @param {string} params.entityAddress - Address to verify
   * @param {string} params.did - Decentralized Identifier
   * @param {string} params.vc - Verifiable Credential JSON string
   * @param {ethers.Signer} signer - Ethers signer
   * @returns {Promise<Object>} Result of verification
   */
  async verifyIdentity(params, signer) {
    try {
      const { entityAddress, did, vc } = params;
      
      // First, register with backend
      const apiResponse = await apiService.post('/identity/register', {
        address: entityAddress,
        did,
        verifiableCredential: vc
      });
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Backend registration failed');
      }
      
      // Then, call the smart contract
      const contract = this.getSoulboundNFTContract(signer);
      
      const tx = await contract.verifyIdentity(entityAddress, did, vc);
      const receipt = await tx.wait();
      
      // Parse event logs to get token ID
      const event = receipt.events.find(e => e.event === 'IdentityVerified');
      
      if (!event) {
        throw new Error('Identity verification event not found in transaction');
      }
      
      const tokenId = event.args.tokenId.toString();
      
      // Update backend with token ID
      await apiService.post('/identity/update', {
        did,
        tokenId
      });
      
      return {
        success: true,
        tokenId,
        did,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Error verifying identity:', error);
      throw error;
    }
  }

  /**
   * Add a chain identity for cross-chain operations
   * @param {Object} params - Chain identity parameters
   * @param {string} params.tokenId - SoulboundNFT token ID
   * @param {string} params.chainId - Target chain ID
   * @param {string} params.chainAddress - Address on target chain
   * @param {ethers.Signer} signer - Ethers signer
   * @returns {Promise<Object>} Result of adding chain identity
   */
  async addChainIdentity(params, signer) {
    try {
      const { tokenId, chainId, chainAddress } = params;
      
      // Call the smart contract
      const contract = this.getSoulboundNFTContract(signer);
      
      const tx = await contract.addChainIdentity(tokenId, chainId, chainAddress);
      const receipt = await tx.wait();
      
      // Register with backend
      await apiService.post('/identity/chain', {
        tokenId,
        chainId,
        chainAddress
      });
      
      return {
        success: true,
        tokenId,
        chainId,
        chainAddress,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Error adding chain identity:', error);
      throw error;
    }
  }

  /**
   * Get token information by ID
   * @param {string} tokenId - SoulboundNFT token ID
   * @returns {Promise<Object>} Token information
   */
  async getTokenInfo(tokenId) {
    try {
      // Get from backend
      const response = await apiService.get(`/identity/token/${tokenId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get token information');
      }
      
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  /**
   * Request verification across chains
   * @param {Object} params - Verification parameters
   * @param {string} params.did - Decentralized Identifier
   * @param {string} params.targetChain - Target chain ID
   * @param {ethers.Signer} signer - Ethers signer
   * @returns {Promise<Object>} Verification request result
   */
  async requestCrossChainVerification(params, signer) {
    try {
      const { did, targetChain } = params;
      
      // Call the smart contract
      const contract = this.getCrossChainBridgeContract(signer);
      
      const tx = await contract.requestVerification(did, targetChain);
      const receipt = await tx.wait();
      
      // Parse event logs to get request ID
      const event = receipt.events.find(e => e.event === 'VerificationRequested');
      
      if (!event) {
        throw new Error('Verification request event not found in transaction');
      }
      
      const requestId = event.args.requestId.toString();
      
      // Register with backend
      await apiService.post('/verification/request', {
        requestId,
        did,
        targetChain
      });
      
      return {
        success: true,
        requestId,
        did,
        targetChain,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Error requesting verification:', error);
      throw error;
    }
  }
}

export const identityService = new IdentityService();