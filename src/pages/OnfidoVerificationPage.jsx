import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useInitVerificationMutation, useGetVerificationStatusQuery } from '../features/kyc/kycApiSlice';
import { setVerification, setStatus } from '../features/kyc/kycSlice';
import onfidoService from '../services/onfidoService';

const OnfidoVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { verificationId } = useSelector(state => state.kyc);
  
  // Extract level from location state or use default
  const level = location.state?.level || 'BASIC';
  
  // Get user data from auth state
  const { user } = useSelector(state => state.auth);
  
  // Initialize verification with backend
  const [initVerification, { isLoading: isInitializing }] = useInitVerificationMutation();
  
  // Poll for verification status if we have a verificationId
  const { data: verificationStatus, refetch } = useGetVerificationStatusQuery(verificationId, {
    skip: !verificationId,
    pollingInterval: 5000, // Poll every 5 seconds
  });
  
  // Initialize verification on component mount
  useEffect(() => {
    const startVerification = async () => {
      try {
        // Create a verification request on our backend
        const response = await initVerification({
          level,
          provider: 'onfido',
          userData: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
          }
        }).unwrap();
        
        if (response.success) {
          // Save verification ID to state
          dispatch(setVerification({
            verificationId: response.verificationId,
            status: response.status,
            level
          }));
          
          // Get the Onfido SDK token from the response
          setToken(response.sdkToken);
        } else {
          setError('Failed to initialize verification');
        }
      } catch (err) {
        console.error('Error initializing verification:', err);
        setError(err.message || 'An error occurred during initialization');
      }
    };
    
    // Only start verification if we don't already have a verification ID
    if (!verificationId) {
      startVerification();
    }
  }, [dispatch, initVerification, level, user, verificationId]);
  
  // Initialize Onfido SDK when we have a token
  useEffect(() => {
    if (token) {
      try {
        onfidoService.initialize(token, {
          containerId: 'onfido-mount',
          onComplete: (data) => {
            console.log('Onfido verification completed:', data);
            dispatch(setStatus('COMPLETED'));
            // Refetch verification status from our backend
            refetch();
            
            // Navigate back to KYC page after a delay
            setTimeout(() => {
              navigate('/kyc');
            }, 1500);
          },
          onError: (error) => {
            console.error('Onfido error:', error);
            setError(error.message || 'An error occurred during verification');
          }
        }).start();
      } catch (err) {
        console.error('Error initializing Onfido SDK:', err);
        setError(err.message || 'Failed to initialize verification process');
      }
    }
    
    // Clean up Onfido SDK on unmount
    return () => {
      if (token) {
        onfidoService.tearDown();
      }
    };
  }, [token, dispatch, navigate, refetch]);
  
  // Update status when backend status changes
  useEffect(() => {
    if (verificationStatus?.verification) {
      dispatch(setStatus(verificationStatus.verification.status));
      
      // If verification is completed, navigate back to KYC page
      if (['APPROVED', 'VERIFIED'].includes(verificationStatus.verification.status)) {
        navigate('/kyc');
      }
    }
  }, [verificationStatus, dispatch, navigate]);
  
  if (isInitializing) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>Initializing verification process...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/kyc')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Back to KYC Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Identity Verification</h1>
        
        {/* Onfido will mount to this element */}
        <div id="onfido-mount" className="min-h-[600px]"></div>
      </div>
    </div>
  );
};

export default OnfidoVerificationPage;