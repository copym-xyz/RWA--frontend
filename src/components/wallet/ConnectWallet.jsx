import React, { useState, useEffect } from 'react';
import { connectToPolygonAmoy, getConnectedAccount, formatAddress } from '../../utils/web3';

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await getConnectedAccount();
      if (connected) {
        setAccount(connected);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { address } = await connectToPolygonAmoy();
      setAccount(address);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connection">
      {!account ? (
        <button 
          className="connect-button" 
          onClick={handleConnect} 
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="account-info">
          <span className="account-address">{formatAddress(account)}</span>
          <span className="network-badge">Polygon Amoy</span>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ConnectWallet;