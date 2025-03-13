import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Identity from './pages/Identity';
import Verification from './pages/Verification';
import CrossChainManager from './pages/CrossChainManager';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/identity" element={<Identity />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/cross-chain" element={<CrossChainManager />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;