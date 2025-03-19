import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetUserVerificationsQuery, useGenerateProofMutation } from '../features/kyc/kycApiSlice';
import { setVerification, setProof } from '../features/kyc/kycSlice';

const KycPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { verificationId, status, level, proofId } = useSelector(state => state.kyc);
  
  // Fetch user's verification history
  const { data: verificationsData, isLoading } = useGetUserVerificationsQuery();
  
  // Generate ZK proof mutation
  const [generateProof, { isLoading: isGeneratingProof }] = useGenerateProofMutation();
  
  // Update verification state when data is loaded
  useEffect(() => {
    if (verificationsData?.verifications && verificationsData.verifications.length > 0) {
      // Get the most recent verification
      const latestVerification = verificationsData.verifications[0];
      
      dispatch(setVerification({
        verificationId: latestVerification.id,
        status: latestVerification.status,
        level: latestVerification.verification_level
      }));
    }
  }, [verificationsData, dispatch]);
  
  const startVerification = (level) => {
    navigate('/kyc/verify', { state: { level } });
  };
  
  const handleGenerateProof = async () => {
    if (!verificationId) return;
    
    try {
      const response = await generateProof(verificationId).unwrap();
      
      if (response.success) {
        dispatch(setProof({
          proofId: response.proofId,
          zkProof: response.publicInputs
        }));
      }
    } catch (error) {
      console.error('Error generating proof:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>
        
        {/* Verification Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          
          {status ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${
                  status === 'APPROVED' || status === 'VERIFIED' ? 'bg-green-500' :
                  status === 'PENDING' || status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {status === 'APPROVED' || status === 'VERIFIED' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : status === 'PENDING' || status === 'IN_PROGRESS' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{level || 'KYC'} Verification</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium">{status}</span>
                  </p>
                </div>
              </div>
              
              {(status === 'APPROVED' || status === 'VERIFIED') && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Your identity has been verified. You can now generate a zero-knowledge proof to share your verification status without revealing your personal information.
                  </p>
                  <button
                    onClick={handleGenerateProof}
                    disabled={isGeneratingProof || !!proofId}
                    className={`px-4 py-2 rounded-md ${
                      proofId 
                        ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                        : isGeneratingProof 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {proofId 
                      ? 'Proof Generated' 
                      : isGeneratingProof 
                        ? 'Generating...' 
                        : 'Generate ZK Proof'}
                  </button>
                  
                  {proofId && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-semibold text-green-800">Proof Generated Successfully</p>
                      <p className="text-xs text-gray-600 mt-1">Proof ID: {proofId}</p>
                    </div>
                  )}
                </div>
              )}
              
              {(status === 'PENDING' || status === 'IN_PROGRESS') && (
                <p className="text-sm text-gray-600">
                  Your verification is being processed. This may take a few minutes.
                </p>
              )}
              
              {(status === 'REJECTED' || status === 'FAILED') && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Your verification was not successful. Please try again with valid documentation.
                  </p>
                  <button
                    onClick={() => startVerification(level || 'BASIC')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              You have not completed KYC verification yet. Choose a verification level to get started.
            </p>
          )}
        </div>
        
        {/* Verification Levels */}
        {!status && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Verification Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all">
                <h3 className="font-bold mb-2">Basic Verification</h3>
                <p className="text-sm text-gray-600 mb-4">Simple ID verification for basic access.</p>
                <button
                  onClick={() => startVerification('BASIC')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 w-full"
                >
                  Start Basic Verification
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all">
                <h3 className="font-bold mb-2">Advanced Verification</h3>
                <p className="text-sm text-gray-600 mb-4">Comprehensive ID verification for full access.</p>
                <button
                  onClick={() => startVerification('ADVANCED')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 w-full"
                >
                  Start Advanced Verification
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all">
                <h3 className="font-bold mb-2">Business Verification</h3>
                <p className="text-sm text-gray-600 mb-4">Business entity verification for institutional access.</p>
                <button
                  onClick={() => startVerification('BUSINESS')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 w-full"
                >
                  Start Business Verification
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Verification History */}
        {verificationsData?.verifications && verificationsData.verifications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Verification History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Level</th>
                    <th className="py-3 px-4 text-left">Provider</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {verificationsData.verifications.map(verification => (
                    <tr key={verification.id} className="border-t">
                      <td className="py-3 px-4">{new Date(verification.submitted_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{verification.verification_level}</td>
                      <td className="py-3 px-4">{verification.provider}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          verification.status === 'APPROVED' || verification.status === 'VERIFIED' 
                            ? 'bg-green-100 text-green-800' 
                            : verification.status === 'PENDING' || verification.status === 'IN_PROGRESS' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {verification.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycPage;