import React, { useState } from 'react';
import { useGetKycVerificationsQuery, useApproveKycMutation } from '../../features/admin/adminApiSlice';

const KycManagement = () => {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [notes, setNotes] = useState('');
  
  const { data, isLoading, error, refetch } = useGetKycVerificationsQuery({
    status: statusFilter
  });
  
  const [approveKyc, { isLoading: isApproving }] = useApproveKycMutation();
  
  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    try {
      await approveKyc({
        verificationId: selectedVerification.id,
        notes
      }).unwrap();
      
      setSelectedVerification(null);
      setNotes('');
      refetch();
    } catch (err) {
      console.error('Failed to approve KYC:', err);
    }
  };
  
  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Failed to load KYC verifications: {error.message || 'Unknown error'}
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">KYC Verification Management</h1>
        <p className="text-gray-600">Review and process identity verification requests</p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
              <option value="ALL">All Providers</option>
              <option value="onfido">Onfido</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Level</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
              <option value="ALL">All Levels</option>
              <option value="BASIC">Basic</option>
              <option value="ADVANCED">Advanced</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Verification List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.verifications?.length > 0 ? (
                data.verifications.map((verification) => (
                  <tr key={verification.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {verification.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.did ? (
                        <span>{verification.did.substring(0, 12)}...</span>
                      ) : (
                        <span>{verification.wallet_address.substring(0, 8)}...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.verification_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        verification.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        verification.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        verification.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {verification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(verification.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(verification)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        View
                      </button>
                      {verification.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedVerification(verification);
                            setNotes('Approved by admin');
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No verification requests found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Verification Details</h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-mono text-sm">{selectedVerification.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedVerification.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    selectedVerification.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    selectedVerification.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedVerification.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-mono text-sm">
                    {selectedVerification.wallet_address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DID</p>
                  <p className="font-mono text-sm">
                    {selectedVerification.did || 'Not created yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p>{selectedVerification.verification_level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p>{selectedVerification.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p>{new Date(selectedVerification.submitted_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p>{selectedVerification.verified_at ? new Date(selectedVerification.verified_at).toLocaleString() : 'Not verified yet'}</p>
                </div>
              </div>
              
              {/* Verification Data */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Verification Data</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(selectedVerification.verification_data || {}, null, 2)}
                  </pre>
                </div>
              </div>
              
              {/* Document Images (placeholder) */}
              {selectedVerification.provider === 'onfido' && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Verification Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-md p-2">
                      <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                        Document Front
                      </div>
                      <p className="text-xs text-center mt-1">ID Card (Front)</p>
                    </div>
                    <div className="border border-gray-200 rounded-md p-2">
                      <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                        Document Back
                      </div>
                      <p className="text-xs text-center mt-1">ID Card (Back)</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admin Action Area */}
              {selectedVerification.status === 'PENDING' && (
                <div>
                  <h3 className="font-semibold mb-2">Admin Action</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
                      rows="3"
                      placeholder="Add notes about this verification..."
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {isApproving ? 'Processing...' : 'Approve Verification'}
                    </button>
                    
                    <button
                      onClick={() => setSelectedVerification(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycManagement;