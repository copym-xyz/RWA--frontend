import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { API_URL, BLOCKCHAIN_CONFIG, SUPPORTED_BLOCKCHAINS } from '../config';

// Icons
import { 
  ArrowsRightLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Bridge = () => {
  const { currentUser, token } = useAuth();
  const { 
    ethereumAddress, 
    solanaAddress, 
    connectEthereum, 
    connectSolana, 
    ethereumConnected, 
    solanaConnected 
  } = useWeb3();
  const navigate = useNavigate();
  
  const [bridgeRequests, setBridgeRequests] = useState([]);
  const [sourceChain, setSourceChain] = useState('');
  const [targetChain, setTargetChain] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Redirect if user doesn't have a DID or isn't verified
    if (currentUser) {
      if (!currentUser.did) {
        navigate('/identity', { 
          state: { 
            error: 'You need to create a DID before using the bridge'
          }
        });
        return;
      }
      
      if (currentUser.verificationStatus !== 'verified') {
        navigate('/verification', { 
          state: { 
            error: 'You need to complete verification before using the bridge'
          }
        });
        return;
      }
    }
    
    const fetchBridgeRequests = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `${API_URL}/api/bridge/requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setBridgeRequests(response.data);
        
        // Set default source chain based on user's addresses
        if (currentUser) {
          if (currentUser.ethereumAddress) {
            setSourceChain('ethereum');
          } else if (currentUser.solanaAddress) {
            setSourceChain('solana');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bridge requests:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    
    fetchBridgeRequests();
  }, [currentUser, token, navigate]);
  
  // Set default target chain when source chain changes
  useEffect(() => {
    if (sourceChain === 'ethereum') {
      setTargetChain('solana');
    } else if (sourceChain === 'solana') {
      setTargetChain('ethereum');
    } else {
      setTargetChain('');
    }
  }, [sourceChain]);
  
  const handleSourceChainChange = (e) => {
    setSourceChain(e.target.value);
  };
  
  const handleTargetChainChange = (e) => {
    setTargetChain(e.target.value);
  };
  
  const handleTargetAddressChange = (e) => {
    setTargetAddress(e.target.value);
  };
  
  const handleConnectWallet = async (blockchain) => {
    try {
      if (blockchain === 'ethereum') {
        const address = await connectEthereum();
        if (address) {
          setTargetAddress(address);
        }
      } else if (blockchain === 'solana') {
        const address = await connectSolana();
        if (address) {
          setTargetAddress(address);
        }
      }
    } catch (error) {
      console.error(`Error connecting to ${blockchain}:`, error);
      setError(error.message);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Validate inputs
      if (!sourceChain) {
        throw new Error('Please select a source chain');
      }
      
      if (!targetChain) {
        throw new Error('Please select a target chain');
      }
      
      if (!targetAddress) {
        throw new Error('Please enter a target address');
      }
      
      // Submit bridge request
      const response = await axios.post(
        `${API_URL}/api/bridge/bridge-identity`,
        {
          sourceChain,
          targetChain,
          targetAddress,
          did: currentUser.did
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Add the new request to the list
      setBridgeRequests([response.data, ...bridgeRequests]);
      
      setSuccess('Bridge request submitted successfully!');
      
      // Reset form
      setTargetAddress('');
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting bridge request:', error);
      setError(error.response?.data?.message || error.message);
      setSubmitting(false);
    }
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Completed
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            {status === 'pending' ? 'Pending' : 'Processing'}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Helper function to format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cross-Chain Bridge</h1>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Bridge Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Bridge Your Identity</h2>
            
            <div className="mb-6">
              <p className="text-gray-500">
                Extend your identity to other blockchains by bridging your DID. This enables you to use the same identity across multiple chains.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Chain
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {SUPPORTED_BLOCKCHAINS.map(chain => {
                      const config = BLOCKCHAIN_CONFIG[chain];
                      const userHasAddress = currentUser && currentUser[`${chain}Address`];
                      
                      return (
                        <label
                          key={chain}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 
                            ${!userHasAddress ? 'opacity-50 cursor-not-allowed' : ''}
                            ${sourceChain === chain ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                        >
                          <input
                            type="radio"
                            name="sourceChain"
                            value={chain}
                            checked={sourceChain === chain}
                            onChange={handleSourceChainChange}
                            disabled={!userHasAddress}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            <img 
                              src={config.logo} 
                              alt={config.name} 
                              className="w-6 h-6 mr-2"
                              onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                            />
                            <span className="font-medium">{config.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {!currentUser?.ethereumAddress && !currentUser?.solanaAddress && (
                    <p className="mt-2 text-sm text-red-600">
                      You need to link at least one blockchain address in the Identity page.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Chain
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {SUPPORTED_BLOCKCHAINS.map(chain => {
                      const config = BLOCKCHAIN_CONFIG[chain];
                      
                      // Skip if this is the source chain
                      if (chain === sourceChain) {
                        return null;
                      }
                      
                      return (
                        <label
                          key={chain}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 
                            ${targetChain === chain ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                        >
                          <input
                            type="radio"
                            name="targetChain"
                            value={chain}
                            checked={targetChain === chain}
                            onChange={handleTargetChainChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center">
                            <img 
                              src={config.logo} 
                              alt={config.name} 
                              className="w-6 h-6 mr-2"
                              onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                            />
                            <span className="font-medium">{config.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-700">
                    Target Address
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="targetAddress"
                      id="targetAddress"
                      className="flex-1 min-w-0 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={targetChain === 'ethereum' ? '0x...' : targetChain === 'solana' ? '...' : ''}
                      value={targetAddress}
                      onChange={handleTargetAddressChange}
                    />
                    <button
                      type="button"
                      onClick={() => handleConnectWallet(targetChain)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                      {targetChain === 'ethereum' && ethereumConnected ? 'Use Connected' : 
                       targetChain === 'solana' && solanaConnected ? 'Use Connected' : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center pt-4">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-primary-500 mr-2" />
                  <p className="text-gray-700">
                    Bridge from <span className="font-medium">{sourceChain ? BLOCKCHAIN_CONFIG[sourceChain].name : '...'}</span>{' '}
                    to <span className="font-medium">{targetChain ? BLOCKCHAIN_CONFIG[targetChain].name : '...'}</span>
                  </p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={submitting || !sourceChain || !targetChain || !targetAddress}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      submitting || !sourceChain || !targetChain || !targetAddress
                        ? 'bg-gray-400'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                    } w-full justify-center`}
                  >
                    {submitting ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Bridge Identity</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div>
          {/* Bridge Requests List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bridge Requests</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : bridgeRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No bridge requests yet</p>
                <p className="text-sm mt-2">Bridge your identity to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bridgeRequests.map(request => (
                  <div key={request._id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <img 
                          src={`/images/${request.sourceChain}-logo.svg`} 
                          alt={request.sourceChain} 
                          className="h-5 w-5" 
                          onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                        />
                        <span className="mx-2">→</span>
                        <img 
                          src={`/images/${request.targetChain}-logo.svg`} 
                          alt={request.targetChain} 
                          className="h-5 w-5" 
                          onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                        />
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDate(request.createdAt)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-500">From</div>
                        <div className="font-mono text-xs truncate">{formatAddress(request.sourceAddress)}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-500">To</div>
                        <div className="font-mono text-xs truncate">{formatAddress(request.targetAddress)}</div>
                      </div>
                    </div>
                    
                    {request.status === 'completed' && request.transactionHash && (
                      <div className="mt-2">
                        <a
                          href={`${BLOCKCHAIN_CONFIG[request.targetChain].explorer.testnet}/tx/${request.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-xs"
                        >
                          View Transaction
                        </a>
                      </div>
                    )}
                    
                    {request.status === 'failed' && request.errorMessage && (
                      <div className="mt-2 text-xs text-red-600">
                        {request.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;