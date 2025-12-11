// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AddPlayer from './components/AddPlayer';
import CoinDistributor from './components/CoinDistributor';
import SpinControl from './components/SpinControl';
import AdminDashboard from './components/AdminDashboard';  // ← NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/add-player" element={<AddPlayer />} />
        <Route path="/admin/coin-distributor" element={<CoinDistributor />} />
        <Route path="/admin/spin-control" element={<SpinControl />} />
        
        {/* Dashboard + Default Route */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />  {/* Default */}
        <Route path="*" element={<AdminDashboard />} />       {/* Catch-all */}
      </Routes>
    </Router>
  );
}

export default App;