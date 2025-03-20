import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCreateDIDMutation } from '../features/identity/identityApiSlice';
import { setIdentity } from '../features/identity/identitySlice';

const CreateIdentityPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { walletAddress } = useSelector(state => state.auth);
  
  const [createDID, { isLoading }] = useCreateDIDMutation();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Create DID with additional metadata
      const response = await createDID({
        walletAddress,
        chain: 'polygon',
        metadata: formData
      }).unwrap();
      
      // Update identity state
      if (response.success) {
        dispatch(setIdentity({
          did: response.did,
          sbtTokenId: response.sbtTokenId,
          document: response.didDocument
        }));
        
        // Navigate back to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to create identity');
      }
    } catch (err) {
      console.error('Error creating identity:', err);
      setError(err.message || 'An error occurred during identity creation');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Create Decentralized Identity</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2"
              value={walletAddress}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Your DID will be associated with this wallet address</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm p-2"
              placeholder="Your name or organization"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm p-2"
              placeholder="Your email address"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm p-2"
              rows="3"
              placeholder="Additional information about your identity"
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold`}
          >
            {isLoading ? 'Creating Identity...' : 'Create Decentralized Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIdentityPage;