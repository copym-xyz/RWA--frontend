import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import AppLayout from './components/layout/AppLayout';
import WalletConnectPage from './pages/WalletConnectPage';
import RequireAuth from './components/auth/RequireAuth';
import DashboardPage from './pages/DashboardPage';
import CreateIdentityPage from './pages/CreateIdentityPage';
import CredentialDetailPage from './pages/CredentialDetailPage';
import CredentialsPage from './pages/CredentialPage';
import KycPage from './pages/KycPage';
import OnfidoVerificationPage from './pages/OnfidoVerificationPage';
import BridgePage from './pages/BridgePage';
import store from './app/store';
import './styles/dark-theme.css';  // Import dark theme

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)]">
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<WalletConnectPage />} />
              
              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="identity/create" element={<CreateIdentityPage />} />
                <Route path="credentials" element={<CredentialsPage />} />
                <Route path="credentials/:credentialHash" element={<CredentialDetailPage />} />
                <Route path="kyc" element={<KycPage />} />
                <Route path="kyc/verify" element={<OnfidoVerificationPage />} />
                <Route path="bridge" element={<BridgePage />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App; 