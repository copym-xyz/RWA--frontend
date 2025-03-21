import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import onfidoService from '../services/onfidoService';
import '../styles/dark-theme.css';

// Add error boundary around SDK loading
const withErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    state = { hasError: false, errorMessage: null };
    
    static getDerivedStateFromError(error) {
      return { hasError: true, errorMessage: error.message };
    }
    
    componentDidCatch(error, info) {
      console.error('SDK Error Boundary caught error:', error, info);
    }
    
    render() {
      if (this.state.hasError) {
        return (
          <div className="dark-card glass-effect">
            <h3 className="text-red-400 font-medium mb-2">SDK Loading Error</h3>
            <p className="text-gray-300 mb-4">{this.state.errorMessage || 'Failed to load SDK'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="dark-button"
            >
              Refresh Page
            </button>
          </div>
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  };
};

const OnfidoVerificationPage = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user) || {};
  const containerRef = useRef(null);
  const sdkInitializedRef = useRef(false);
  const maxRetries = 3;
  const retryDelayMs = 1000;

  // Effect to load Onfido SDK script
  useEffect(() => {
    let retryCount = 0;
    let scriptElement = null;
    let styleElement = null;

    const loadSDK = () => {
      // Check if SDK is already loaded
      if (window.Onfido) {
        console.log('Onfido SDK already loaded');
        setSdkLoaded(true);
        return;
      }

      // Remove any existing failed script/style elements
      const existingScript = document.querySelector('script[src*="onfido"]');
      const existingStyle = document.querySelector('link[href*="onfido"]');
      if (existingScript) existingScript.remove();
      if (existingStyle) existingStyle.remove();

      // Load CSS
      styleElement = document.createElement('link');
      styleElement.rel = 'stylesheet';
      styleElement.href = 'https://assets.onfido.com/web-sdk-releases/14.43.0/style.css';
      
      // Load JavaScript
      scriptElement = document.createElement('script');
      scriptElement.src = 'https://assets.onfido.com/web-sdk-releases/14.43.0/onfido.min.js';
      scriptElement.async = true;

      scriptElement.onload = () => {
        console.log('Onfido SDK loaded successfully');
        setSdkLoaded(true);
      };

      scriptElement.onerror = () => {
        console.error(`Failed to load Onfido SDK (attempt ${retryCount + 1}/${maxRetries})`);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(loadSDK, retryDelayMs);
        } else {
          setError('Failed to load verification SDK. Please refresh the page and try again.');
          setIsLoading(false);
        }
      };

      document.head.appendChild(styleElement);
      document.head.appendChild(scriptElement);
    };

    loadSDK();

    return () => {
      // Cleanup function
      if (scriptElement) scriptElement.remove();
      if (styleElement) styleElement.remove();
      if (sdkInitializedRef.current) {
        onfidoService.tearDown();
        sdkInitializedRef.current = false;
      }
    };
  }, []);

  // Effect to initialize verification when SDK is loaded
  useEffect(() => {
    const initializeVerification = async () => {
      if (!sdkLoaded || sdkInitializedRef.current) return;

      try {
        setIsLoading(true);
        const response = await fetch('/api/kyc/init-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            firstName: user?.firstName || 'Test',
            lastName: user?.lastName || 'User',
            email: user?.email || 'test@example.com'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to initialize verification');
        }

        const data = await response.json();
        console.log('Verification data received:', data);
        
        if (!data.sdkToken || !data.workflowRunId) {
          throw new Error('Invalid response from server: missing required data');
        }

        setVerificationData(data);
        setIsLoading(false);

        // Initialize Onfido SDK
        const mountElement = document.getElementById('onfido-mount');
        if (!mountElement) {
          throw new Error('Mount element not found');
        }

        sdkInitializedRef.current = true;
        await onfidoService.initialize(
          data.sdkToken,
          data.workflowRunId,
          {
            containerId: 'onfido-mount',
            useModal: true,
            isModalOpen: true,
            onComplete: (data) => {
              console.log('Verification completed:', data);
              navigate('/kyc', { 
                state: { 
                  verificationComplete: true,
                  applicantId: data.applicantId
                }
              });
            },
            onError: (error) => {
              console.error('Verification error:', error);
              setError(error.message || 'Error during verification process');
              sdkInitializedRef.current = false;
            },
            onModalRequestClose: () => {
              navigate('/kyc');
            }
          }
        );
      } catch (error) {
        console.error('Verification initialization error:', error);
        setError(error.message || 'Failed to initialize verification');
        setIsLoading(false);
      }
    };

    initializeVerification();
  }, [sdkLoaded, navigate, user]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-effect max-w-md w-full p-8 rounded-xl">
          <h2 className="text-[var(--text-primary)] text-xl font-semibold mb-4">Verification Error</h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => navigate('/kyc')}
            className="dark-button w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !sdkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loading-spinner mb-4"></div>
        <p className="text-[var(--text-secondary)]">
          {!sdkLoaded ? 'Loading verification SDK...' : 'Initializing verification...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div 
        id="onfido-mount" 
        ref={containerRef}
        className="w-full max-w-4xl glass-effect"
        style={{ 
          minHeight: '600px',
          background: 'var(--background-secondary)',
          borderRadius: '1rem',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

// Wrap component with error boundary
export default withErrorBoundary(OnfidoVerificationPage);