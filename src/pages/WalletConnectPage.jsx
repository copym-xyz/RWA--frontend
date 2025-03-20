import React from 'react';
import WalletConnect from '../components/WalletConnect';

const WalletConnectPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Identity Bridge</h1>
        <p className="text-center text-gray-600 mb-8">
          Connect your wallet to get started with decentralized identity management
        </p>
        <WalletConnect />
      </div>
    </div>
  );
};

export default WalletConnectPage;