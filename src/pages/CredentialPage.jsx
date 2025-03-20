import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCredentialsForSubjectQuery } from '../features/credentials/credentialsApiSlice';
import { setCredentials } from '../features/credentials/credentialsSlice';

const CredentialCard = ({ credential }) => {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    REVOKED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
    EXPIRED: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold">{credential.credential_type || 'Verifiable Credential'}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[credential.status] || 'bg-gray-100'}`}>
          {credential.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <p>Issuer: {credential.issuer_did.substring(0, 16)}...</p>
        <p>Issued: {new Date(credential.issuance_date).toLocaleDateString()}</p>
        {credential.expiration_date && (
          <p>Expires: {new Date(credential.expiration_date).toLocaleDateString()}</p>
        )}
      </div>
      
      <Link
        to={`/credentials/${credential.credential_hash}`}
        className="block text-center bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
};

const CredentialsPage = () => {
  const dispatch = useDispatch();
  const { did } = useSelector(state => state.identity);
  const { credentials } = useSelector(state => state.credentials);
  
  // Fetch credentials for this DID
  const { data, isLoading, isError } = useGetCredentialsForSubjectQuery(did, {
    skip: !did
  });
  
  // Update state when data is loaded
  useEffect(() => {
    if (data && data.success) {
      dispatch(setCredentials(data.credentials));
    }
  }, [data, dispatch]);
  
  // Define credential types for filtering
  const credentialTypes = [
    'All',
    ...new Set(credentials.map(cred => cred.credential_type || 'Verifiable Credential'))
  ];
  
  const [selectedType, setSelectedType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Filter credentials based on selected type and status
  const filteredCredentials = credentials.filter(cred => {
    const typeMatch = selectedType === 'All' || cred.credential_type === selectedType;
    const statusMatch = statusFilter === 'All' || cred.status === statusFilter;
    return typeMatch && statusMatch;
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Error Loading Credentials</h1>
          <p className="text-center text-gray-600">
            There was an error loading your credentials. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  if (!did) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">No DID Found</h1>
          <p className="text-center text-gray-600 mb-6">
            You need to create a decentralized identity (DID) to manage credentials.
          </p>
          <div className="flex justify-center">
            <Link
              to="/identity/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Identity
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">My Credentials</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              {credentialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              <option value="All">All</option>
              <option value="ACTIVE">Active</option>
              <option value="REVOKED">Revoked</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
        
        {/* Credentials Grid */}
        {filteredCredentials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map(credential => (
              <CredentialCard
                key={credential.credential_hash}
                credential={credential}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Credentials Found</h2>
            <p className="text-gray-600 mb-6">
              {credentials.length > 0
                ? 'No credentials match your current filters.'
                : 'You don\'t have any credentials yet.'}
            </p>
            <Link
              to="/kyc"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Complete KYC Verification
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialsPage;