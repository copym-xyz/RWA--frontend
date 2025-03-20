import React from 'react';
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
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logOut());
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
    <nav className="bg-blue-600 fixed top-0 left-0 right-0 h-16 z-10 shadow-md">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-white text-xl font-bold">
            Identity Bridge
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              Dashboard
            </Link>
            <Link to="/credentials" className="text-white hover:text-gray-200">
              Credentials
            </Link>
            <Link to="/bridge" className="text-white hover:text-gray-200">
              Bridge
            </Link>
            <Link to="/kyc" className="text-white hover:text-gray-200">
              KYC
            </Link>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <span className="text-white hidden md:inline">
              {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : ''}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;