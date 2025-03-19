import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CredentialsPage from './pages/CredentialsPage';
import CredentialDetailPage from './pages/CredentialDetailPage';
import BridgePage from './pages/BridgePage';
import KycPage from './pages/KycPage';
import OnfidoVerificationPage from './pages/OnfidoVerificationPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import CredentialManagement from './pages/admin/CredentialManagement';
import KycManagement from './pages/admin/KycManagement';
import BridgeConfig from './pages/admin/BridgeConfig';
import SystemHealth from './pages/admin/SystemHealth';

// Auth Guards
import RequireAuth from './features/auth/RequireAuth';
import RequireAdmin from './features/auth/RequireAdmin';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route element={<RequireAuth />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="credentials" element={<CredentialsPage />} />
              <Route path="credentials/:credentialHash" element={<CredentialDetailPage />} />
              <Route path="bridge" element={<BridgePage />} />
              <Route path="kyc" element={<KycPage />} />
              <Route path="kyc/verify" element={<OnfidoVerificationPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:userId" element={<UserDetail />} />
              <Route path="credentials" element={<CredentialManagement />} />
              <Route path="kyc" element={<KycManagement />} />
              <Route path="bridge" element={<BridgeConfig />} />
              <Route path="health" element={<SystemHealth />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;