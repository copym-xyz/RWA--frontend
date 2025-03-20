import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

const AppLayout = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {isAuthenticated && <Navbar />}
      <div className={`flex flex-1 ${isAuthenticated ? 'pt-16' : ''}`}>
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;