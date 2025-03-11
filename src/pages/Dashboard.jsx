import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL, BLOCKCHAIN_CONFIG } from '../config';

// Icons
import { 
  IdentificationIcon, 
  ShieldCheckIcon, 
  ArrowsRightLeftIcon, 
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { currentUser, token } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [bridgeRequests, setBridgeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch verification status if user has a DID
        if (currentUser?.did) {
          const verificationResponse = await axios.get(
            `${API_URL}/api/verification/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setVerificationStatus(verificationResponse.data);
        }
        
        // Fetch bridge requests if user has a DID
        if (currentUser?.did) {
          const bridgeResponse = await axios.get(
            `${API_URL}/api/bridge/requests`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setBridgeRequests(bridgeResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, token]);
  
  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            {status === 'verified' ? 'Verified' : 'Completed'}
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
      case 'rejected':
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            {status === 'rejected' ? 'Rejected' : 'Failed'}
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <IdentificationIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold">Identity Status</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">DID Status</p>
                {currentUser?.did ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">Not Created</span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Linked Blockchains</p>
                <div className="flex space-x-2">
                  {currentUser?.ethereumAddress && (
                    <div className="p-1 bg-ethereum bg-opacity-10 rounded-full">
                      <img src="/images/ethereum-logo.svg" alt="Ethereum" className="h-5 w-5" onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }} />
                    </div>
                  )}
                  
                  {currentUser?.solanaAddress && (
                    <div className="p-1 bg-solana bg-opacity-10 rounded-full">
                      <img src="/images/solana-logo.svg" alt="Solana" className="h-5 w-5" onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }} />
                    </div>
                  )}
                  
                  {currentUser?.polygonAddress && (
                    <div className="p-1 bg-polygon bg-opacity-10 rounded-full">
                      <img src="/images/polygon-logo.svg" alt="Polygon" className="h-5 w-5" onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }} />
                    </div>
                  )}
                  
                  {!currentUser?.ethereumAddress && !currentUser?.solanaAddress && !currentUser?.polygonAddress && (
                    <span className="text-gray-500">No blockchains linked</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/identity"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full justify-center"
              >
                Manage Identity
              </Link>
            </div>
          </div>
          
          {/* Verification Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-secondary-100 p-3 rounded-full mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-secondary-600" />
              </div>
              <h2 className="text-lg font-semibold">Verification Status</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                {verificationStatus ? (
                  getStatusBadge(verificationStatus.status)
                ) : currentUser?.verificationStatus ? (
                  getStatusBadge(currentUser.verificationStatus)
                ) : (
                  <span className="text-gray-500">Not started</span>
                )}
              </div>
              
              {verificationStatus && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Verification Type</p>
                  <span className="text-gray-700 capitalize">
                    {verificationStatus.verificationType === 'kyc' ? 'KYC (Individual)' : 'KYB (Business)'}
                  </span>
                </div>
              )}
              
              {verificationStatus && verificationStatus.status === 'pending' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted</p>
                  <span className="text-gray-700">
                    {formatDate(verificationStatus.createdAt)}
                  </span>
                </div>
              )}
              
              {verificationStatus && verificationStatus.status === 'rejected' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reason</p>
                  <span className="text-red-600">
                    {verificationStatus.metadata?.rejectionReason || 'No reason provided'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              {(!verificationStatus || verificationStatus.status === 'rejected') && (
                <Link
                  to="/verification"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 w-full justify-center"
                >
                  Start Verification
                </Link>
              )}
              
              {verificationStatus && (verificationStatus.status === 'pending' || verificationStatus.status === 'processing') && (
                <Link
                  to="/verification"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 w-full justify-center"
                >
                  Check Status
                </Link>
              )}
              
              {verificationStatus && verificationStatus.status === 'verified' && (
                <Link
                  to="/verification"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 w-full justify-center"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
          
          {/* Cross-Chain Bridge Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <ArrowsRightLeftIcon className="h-6 w-6 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold">Cross-Chain Bridge</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Recent Bridge Requests</p>
                {bridgeRequests.length > 0 ? (
                  <div className="space-y-2">
                    {bridgeRequests.slice(0, 3).map(request => (
                      <div key={request._id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <img 
                              src={`/images/${request.sourceChain}-logo.svg`} 
                              alt={request.sourceChain} 
                              className="h-4 w-4" 
                              onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                            />
                            <span className="mx-1">→</span>
                            <img 
                              src={`/images/${request.targetChain}-logo.svg`} 
                              alt={request.targetChain} 
                              className="h-4 w-4" 
                              onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                            />
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">No bridge requests</span>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/bridge"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 w-full justify-center"
              >
                Manage Cross-Chain Identity
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Getting Started Guide */}
      {(!currentUser?.did || !currentUser?.verificationStatus || currentUser?.verificationStatus === 'unverified') && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Link your blockchain addresses</h3>
                <p className="mt-1 text-gray-500">
                  Connect your Ethereum and Solana wallets to establish your cross-chain identity foundation.
                </p>
                {!currentUser?.ethereumAddress && !currentUser?.solanaAddress && (
                  <Link
                    to="/identity"
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Link Addresses
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Generate your DID</h3>
                <p className="mt-1 text-gray-500">
                  Create your Decentralized Identifier (DID) to establish a unified identity across multiple blockchains.
                </p>
                {currentUser?.ethereumAddress && !currentUser?.did && (
                  <Link
                    to="/identity"
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Generate DID
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Complete verification</h3>
                <p className="mt-1 text-gray-500">
                  Verify your identity with KYC (for individuals) or KYB (for businesses) to enable full functionality.
                </p>
                {currentUser?.did && (!currentUser?.verificationStatus || currentUser?.verificationStatus === 'unverified') && (
                  <Link
                    to="/verification"
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Start Verification
                  </Link>
                )}
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600">
                  4
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Bridge your identity</h3>
                <p className="mt-1 text-gray-500">
                  Extend your identity to additional blockchains using our cross-chain bridge functionality.
                </p>
                {currentUser?.did && currentUser?.verificationStatus === 'verified' && (
                  <Link
                    to="/bridge"
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Bridge Identity
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;