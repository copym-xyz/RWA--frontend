import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

// Icons
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Verification = () => {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [verificationType, setVerificationType] = useState('kyc');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    companyName: '',
    registrationNumber: '',
    taxId: '',
    industry: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Redirect if user doesn't have a DID
    if (currentUser && !currentUser.did) {
      navigate('/identity', { 
        state: { 
          error: 'You need to create a DID before starting the verification process'
        }
      });
      return;
    }
    
    const fetchVerificationStatus = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `${API_URL}/api/verification/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setVerificationStatus(response.data);
        
        // Set verification type based on existing request
        if (response.data && response.data.verificationType) {
          setVerificationType(response.data.verificationType);
        }
        
        setLoading(false);
      } catch (error) {
        // If no verification request exists, that's okay
        if (error.response && error.response.status === 404) {
          setVerificationStatus(null);
          setLoading(false);
          return;
        }
        
        console.error('Error fetching verification status:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };
    
    fetchVerificationStatus();
  }, [currentUser, token, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleVerificationTypeChange = (e) => {
    setVerificationType(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Prepare metadata based on verification type
      let metadata = {};
      
      if (verificationType === 'kyc') {
        metadata = {
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth
          },
          address: {
            country: formData.country,
            streetAddress: formData.address,
            city: formData.city,
            postalCode: formData.postalCode
          }
        };
      } else if (verificationType === 'kyb') {
        metadata = {
          businessInfo: {
            companyName: formData.companyName,
            registrationNumber: formData.registrationNumber,
            taxId: formData.taxId,
            industry: formData.industry
          },
          address: {
            country: formData.country,
            streetAddress: formData.address,
            city: formData.city,
            postalCode: formData.postalCode
          }
        };
      }
      
      // Submit verification request
      const response = await axios.post(
        `${API_URL}/api/verification/submit`,
        {
          verificationType,
          did: currentUser.did,
          blockchains: [
            ...(currentUser.ethereumAddress ? ['ethereum'] : []),
            ...(currentUser.solanaAddress ? ['solana'] : []),
            ...(currentUser.polygonAddress ? ['polygon'] : [])
          ],
          metadata
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setVerificationStatus(response.data);
      setSuccess('Verification request submitted successfully!');
      
      // Reset form data
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        country: '',
        address: '',
        city: '',
        postalCode: '',
        companyName: '',
        registrationNumber: '',
        taxId: '',
        industry: ''
      });
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting verification request:', error);
      setError(error.response?.data?.message || error.message);
      setSubmitting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Render verification status component
  const renderVerificationStatus = () => {
    if (!verificationStatus) {
      return null;
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
        
        <div className="flex items-center mb-6">
          {verificationStatus.status === 'approved' || verificationStatus.status === 'verified' ? (
            <div className="flex items-center rounded-full bg-green-100 p-3 mr-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          ) : verificationStatus.status === 'pending' || verificationStatus.status === 'processing' ? (
            <div className="flex items-center rounded-full bg-yellow-100 p-3 mr-4">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          ) : (
            <div className="flex items-center rounded-full bg-red-100 p-3 mr-4">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-1">
              {verificationStatus.status === 'approved' || verificationStatus.status === 'verified' ? 
                'Verification Approved' : 
                verificationStatus.status === 'pending' || verificationStatus.status === 'processing' ? 
                  'Verification Pending' : 
                  'Verification Rejected'
              }
            </h3>
            <p className="text-gray-500">
              {verificationStatus.status === 'approved' || verificationStatus.status === 'verified' ? 
                'Your identity has been verified successfully.' : 
                verificationStatus.status === 'pending' ? 
                  'Your verification is being processed.' : 
                  verificationStatus.status === 'processing' ? 
                    'Your verification is being processed by our team.' : 
                    'Your verification request was rejected.'
              }
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Verification Type</p>
              <p className="font-medium">
                {verificationStatus.verificationType === 'kyc' ? 'KYC (Individual)' : 'KYB (Business)'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Request ID</p>
              <p className="font-mono text-sm">
                {verificationStatus.requestId || verificationStatus._id}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Submitted</p>
              <p className="font-medium">
                {formatDate(verificationStatus.createdAt)}
              </p>
            </div>
            
            {verificationStatus.updatedAt && verificationStatus.updatedAt !== verificationStatus.createdAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="font-medium">
                  {formatDate(verificationStatus.updatedAt)}
                </p>
              </div>
            )}
            
            {verificationStatus.did && (
              <div>
                <p className="text-sm text-gray-500 mb-1">DID</p>
                <p className="font-mono text-sm truncate">
                  {verificationStatus.did}
                </p>
              </div>
            )}
            
            {verificationStatus.blockchains && verificationStatus.blockchains.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Blockchains</p>
                <p className="font-medium">
                  {verificationStatus.blockchains.map(chain => chain.charAt(0).toUpperCase() + chain.slice(1)).join(', ')}
                </p>
              </div>
            )}
            
            {verificationStatus.status === 'rejected' && verificationStatus.metadata && verificationStatus.metadata.rejectionReason && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                <p className="text-red-600">
                  {verificationStatus.metadata.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {verificationStatus.status === 'rejected' && (
          <div className="mt-6">
            <button
              onClick={() => setVerificationStatus(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Submit New Request
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render verification form
  const renderVerificationForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
        
        <div className="mb-6">
          <p className="text-gray-500 mb-4">
            Complete the verification process to establish your identity across multiple blockchains.
            This enables you to use all features of the platform and creates a verifiable credential tied to your DID.
          </p>
          
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="verificationType"
                  value="kyc"
                  checked={verificationType === 'kyc'}
                  onChange={handleVerificationTypeChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <UserIcon className="h-6 w-6 text-primary-500 mb-1" />
                  <p className="font-medium">KYC (Individual)</p>
                  <p className="text-sm text-gray-500">For personal accounts</p>
                </div>
              </label>
            </div>
            
            <div className="flex-1">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="verificationType"
                  value="kyb"
                  checked={verificationType === 'kyb'}
                  onChange={handleVerificationTypeChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-500 mb-1" />
                  <p className="font-medium">KYB (Business)</p>
                  <p className="text-sm text-gray-500">For business accounts</p>
                </div>
              </label>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {verificationType === 'kyc' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      id="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      id="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  submitting
                    ? 'bg-gray-400'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                } w-full justify-center`}
              >
                {submitting ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Verification Request</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Identity Verification</h1>
      
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Render verification status if exists */}
          {verificationStatus && renderVerificationStatus()}
          
          {/* Render verification form if no status or rejected */}
          {(!verificationStatus || verificationStatus.status === 'rejected') && renderVerificationForm()}
        </>
      )}
    </div>
  );
};

export default Verification;