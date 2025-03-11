import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { API_URL, BLOCKCHAIN_CONFIG, SUPPORTED_BLOCKCHAINS } from '../config';

// Icons
import { 
  ShieldCheckIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon, 
  PlusCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const Identity = () => {
  const { currentUser, token, updateUser } = useAuth();
  const { 
    ethereumAddress, 
    solanaAddress, 
    ethereumConnected, 
    solanaConnected,
    connectEthereum, 
    connectSolana,
    signMessageWithEthereum,
    signMessageWithSolana,
    loading: web3Loading
  } = useWeb3();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [didGenerating, setDidGenerating] = useState(false);
  
  // Link blockchain address to user
  const linkBlockchainAddress = async (blockchain) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      let address;
      let signature;
      
      // Connect to blockchain wallet if not already connected
      if (blockchain === 'ethereum') {
        if (!ethereumConnected) {
          address = await connectEthereum();
        } else {
          address = ethereumAddress;
        }
        
        // Create a message to sign
        const message = `Link Ethereum address ${address} to your account`;
        signature = await signMessageWithEthereum(message);
      } else if (blockchain === 'solana') {
        if (!solanaConnected) {
          address = await connectSolana();
        } else {
          address = solanaAddress;
        }
        
        // Create a message to sign
        const message = `Link Solana address ${address} to your account`;
        signature = await signMessageWithSolana(message);
      } else {
        throw new Error(`Unsupported blockchain: ${blockchain}`);
      }
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/identity/link-address`,
        {
          blockchain,
          address,
          signature
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update user in context
      updateUser(response.data.user);
      
      setSuccess(`${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)} address linked successfully!`);
    } catch (error) {
      console.error(`Error linking ${blockchain} address:`, error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate DID for user
  const generateDID = async () => {
    try {
      setDidGenerating(true);
      setError('');
      setSuccess('');
      
      // Check if user has at least one blockchain address
      if (!currentUser.ethereumAddress && !currentUser.solanaAddress && !currentUser.polygonAddress) {
        throw new Error('You need to link at least one blockchain address before generating a DID');
      }
      
      // Send request to API
      const response = await axios.post(
        `${API_URL}/api/identity/generate-did`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update user in context
      updateUser({ did: response.data.did });
      
      setSuccess('DID generated successfully!');
    } catch (error) {
      console.error('Error generating DID:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setDidGenerating(false);
    }
  };
  
  // Helper function to format blockchain address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper function to get blockchain status and action
  const getBlockchainStatus = (blockchain) => {
    let address = '';
    let connected = false;
    
    if (blockchain === 'ethereum') {
      address = currentUser?.ethereumAddress;
      connected = ethereumConnected;
    } else if (blockchain === 'solana') {
      address = currentUser?.solanaAddress;
      connected = solanaConnected;
    } else if (blockchain === 'polygon') {
      address = currentUser?.polygonAddress;
      // Polygon not implemented yet
    }
    
    if (address) {
      return {
        status: 'linked',
        action: 'View',
        address,
        icon: <ShieldCheckIcon className="w-5 h-5 text-green-500" />
      };
    } else if (connected) {
      return {
        status: 'connected',
        action: 'Link',
        address: blockchain === 'ethereum' ? ethereumAddress : solanaAddress,
        icon: <LinkIcon className="w-5 h-5 text-yellow-500" />
      };
    } else {
      return {
        status: 'not-connected',
        action: 'Connect',
        address: '',
        icon: <PlusCircleIcon className="w-5 h-5 text-gray-500" />
      };
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Identity Management</h1>
      
      {/* Success and Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* DID Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Decentralized Identifier (DID)</h2>
        
        {currentUser?.did ? (
          <div>
            <p className="mb-2 text-gray-600">Your DID:</p>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
              {currentUser.did}
            </div>
            
            {currentUser.soulboundTokenId && (
              <div className="mt-4">
                <p className="mb-2 text-gray-600">Soulbound Token ID:</p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                  {currentUser.soulboundTokenId}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-gray-600">Verification Status:</p>
              <div className="flex items-center mt-2">
                {currentUser.verificationStatus === 'verified' ? (
                  <>
                    <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">Verified</span>
                  </>
                ) : currentUser.verificationStatus === 'pending' ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-yellow-600 font-medium">Verification Pending</span>
                  </>
                ) : (
                  <>
                    <ExclamationCircleIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-600 font-medium">Not Verified</span>
                  </>
                )}
              </div>
              
              {currentUser.verificationStatus !== 'verified' && (
                <div className="mt-4">
                  <Link
                    to="/verification"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Start Verification Process
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              You don't have a DID yet. Link at least one blockchain address and generate your DID to get started.
            </p>
            
            <button
              onClick={generateDID}
              disabled={didGenerating || (!currentUser?.ethereumAddress && !currentUser?.solanaAddress && !currentUser?.polygonAddress)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${didGenerating || (!currentUser?.ethereumAddress && !currentUser?.solanaAddress && !currentUser?.polygonAddress)
                ? 'bg-gray-400'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {didGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate DID</>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Blockchain Addresses Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Blockchain Addresses</h2>
        
        <div className="space-y-6">
          {SUPPORTED_BLOCKCHAINS.map(blockchain => {
            const config = BLOCKCHAIN_CONFIG[blockchain];
            const status = getBlockchainStatus(blockchain);
            
            return (
              <div key={blockchain} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={config.logo} 
                      alt={config.name} 
                      className="w-8 h-8 mr-3"
                      onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                    />
                    <div>
                      <h3 className="font-medium">{config.name}</h3>
                      {status.address && (
                        <div className="text-sm text-gray-500 font-mono mt-1">
                          {formatAddress(status.address)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 flex items-center">
                      {status.icon}
                      <span className="ml-1 text-sm capitalize">
                        {status.status === 'linked' ? 'Linked' : status.status === 'connected' ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    
                    {status.status === 'linked' ? (
                      <a
                        href={`${config.explorer.testnet}/address/${status.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View on Explorer
                      </a>
                    ) : (
                      <button
                        onClick={() => linkBlockchainAddress(blockchain)}
                        disabled={loading || web3Loading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {loading || web3Loading ? 'Loading...' : status.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Identity;