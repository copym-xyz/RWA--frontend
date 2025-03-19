import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useGetUserProfileQuery } from './authApiSlice';

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const { data, isSuccess } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated
  });
  
  useEffect(() => {
    if (isSuccess && data) {
      // Check if user has admin role
      const hasAdminRole = data.user.roles.some(role => role.name === 'ADMIN');
      setIsAdmin(hasAdminRole);
      setLoading(false);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isSuccess, data, isAuthenticated]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to the login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    // Redirect to the dashboard for non-admin users
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default RequireAdmin;