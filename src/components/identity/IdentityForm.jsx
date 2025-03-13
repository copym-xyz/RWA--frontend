import React, { useState } from 'react';
import { identityApi } from '../../services/api.service';
import { connectToPolygonAmoy } from '../../utils/web3';

const IdentityForm = () => {
  const [formData, setFormData] = useState({
    did: '',
    verifiableCredential: JSON.stringify({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "issuer": "did:example:issuer",
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        "id": "",
        "name": "",
        "email": ""
      }
    }, null, 2)
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'verifiableCredential') {
      try {
        // Ensure it's valid JSON
        JSON.parse(value);
        setFormData({ ...formData, [name]: value });
      } catch (err) {
        // Allow incomplete JSON during typing
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'name' || name === 'email') {
      // Update nested fields in verifiableCredential
      const vc = JSON.parse(formData.verifiableCredential);
      vc.credentialSubject[name] = value;
      setFormData({
        ...formData,
        verifiableCredential: JSON.stringify(vc, null, 2)
      });
    } else {
      // Update DID in both formData and within VC
      setFormData({ ...formData, [name]: value });
      if (name === 'did') {
        const vc = JSON.parse(formData.verifiableCredential);
        vc.credentialSubject.id = value;
        setFormData({
          ...formData,
          verifiableCredential: JSON.stringify(vc, null, 2),
          did: value
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Connect to wallet
      const { address, soulboundContract } = await connectToPolygonAmoy();
      
      // Validate form data
      if (!formData.did.startsWith('did:')) {
        throw new Error('DID must start with "did:"');
      }
      
      // Try to parse VC to ensure it's valid JSON
      const vc = JSON.parse(formData.verifiableCredential);
      
      // Register identity through API
      const response = await identityApi.register({
        address,
        did: formData.did,
        verifiableCredential: formData.verifiableCredential
      });
      
      setSuccess('Identity registered successfully! Please wait for verification.');
      
      // Reset form
      setFormData({
        did: '',
        verifiableCredential: JSON.stringify({
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiableCredential"],
          "issuer": "did:example:issuer",
          "issuanceDate": new Date().toISOString(),
          "credentialSubject": {
            "id": "",
            "name": "",
            "email": ""
          }
        }, null, 2)
      });
    } catch (err) {
      console.error('Error registering identity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-form">
      <h2>Register New Identity</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="did">Decentralized Identifier (DID)</label>
          <input
            type="text"
            id="did"
            name="did"
            value={formData.did}
            onChange={handleChange}
            placeholder="did:example:123456789"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            onChange={handleChange}
            placeholder="Your Name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="verifiableCredential">Verifiable Credential (JSON)</label>
          <textarea
            id="verifiableCredential"
            name="verifiableCredential"
            value={formData.verifiableCredential}
            onChange={handleChange}
            rows={12}
            required
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register Identity'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default IdentityForm;