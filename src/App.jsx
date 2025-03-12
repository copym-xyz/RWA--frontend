import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Identity from './pages/Identity';
import Verification from './pages/Verification';
import CrossChainManager from './pages/CrossChainManager';
import { Toaster } from '@/components/ui/toaster';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/identity" element={<Identity />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/cross-chain" element={<CrossChainManager />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;