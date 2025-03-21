import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logOut } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApiSlice';
import { clearIdentity } from '../../features/identity/identitySlice';
import { clearCredentials } from '../../features/credentials/credentialsSlice';
import { clearKyc } from '../../features/kyc/kycSlice';
import { clearBridge } from '../../features/bridge/bridgeSlice';

const Navbar = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      dispatch(clearIdentity());
      dispatch(clearCredentials());
      dispatch(clearKyc());
      dispatch(clearBridge());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="px-6 py-4 border-b border-[var(--border-color)] relative">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/dashboard" className="text-[var(--text-primary)] text-xl font-bold flex items-center">
          <div className="w-8 h-8 mr-3 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-black font-bold">
            M
          </div>
          <span>Copy<span className="text-[var(--accent-primary)]">m</span></span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/dashboard" 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/credentials" 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Credentials
          </Link>
          <Link 
            to="/kyc" 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            KYC
          </Link>
          <Link 
            to="/bridge" 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Bridge
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-[var(--text-secondary)] truncate max-w-[120px]">
            {user?.walletAddress && `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`}
          </div>
          <button 
            onClick={handleLogout}
            className="dark-button text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;