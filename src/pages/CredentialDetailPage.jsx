import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetCredentialQuery, useRevokeCredentialMutation } from '../features/credentials/credentialsApiSlice';

const CredentialDetailPage = () => {
  const { credentialHash } = useParams();
  const { data, isLoading, error } = useGetCredentialQuery(credentialHash);
  const [revokeCredential, { isLoading: isRevoking }] = useRevokeCredentialMutation();

  const handleRevoke = async () => {
    try {
      await revokeCredential({
        credentialHash,
        reason: 'Revoked by user'
      }).unwrap();
    } catch (err) {
      console.error('Failed to revoke credential:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse bg-white rounded-lg shadow-lg p-6">
          <div className="h-6 bg-gray-200 w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          Failed to load credential: {error.message}
        </div>
      </div>
    );
  }

  const credential = data?.credential;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">
            {credential?.credential_type || 'Verifiable Credential'}
          </h1>
          <span className={`px-2 py-1 rounded-full text-xs ${
            credential?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            credential?.status === 'REVOKED' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {credential?.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Issuer</p>
            <p className="font-mono">{credential?.issuer_did}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-mono">{credential?.subject_did}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issuance Date</p>
            <p>{new Date(credential?.issuance_date).toLocaleDateString()}</p>
          </div>
          {credential?.expiration_date && (
            <div>
              <p className="text-sm text-gray-500">Expiration Date</p>
              <p>{new Date(credential?.expiration_date).toLocaleDateString()}</p>
            </div>
          )}
          {credential?.sbt_token_id && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">SBT Token ID</p>
              <p className="font-mono">{credential.sbt_token_id}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Credential Details</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(credential?.fullCredential || credential, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex justify-between">
          <Link
            to="/credentials"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Credentials
          </Link>
          {credential?.status === 'ACTIVE' && (
            <button 
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
            >
              {isRevoking ? 'Revoking...' : 'Revoke Credential'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialDetailPage