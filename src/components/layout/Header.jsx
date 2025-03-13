// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ConnectWallet from '../wallet/ConnectWallet';
import { Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <Link to="/" className="text-xl font-bold text-gray-900">
            Cross-Chain Identity
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link to="/identity" className="text-gray-600 hover:text-blue-600 font-medium">
            Identity
          </Link>
          <Link to="/verification" className="text-gray-600 hover:text-blue-600 font-medium">
            Verification
          </Link>
          <Link to="/cross-chain" className="text-gray-600 hover:text-blue-600 font-medium">
            Cross-Chain
          </Link>
        </nav>
        
        <div className="flex items-center">
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};

export default Header;