// src/components/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/add-player"
                className="block py-3 px-4 rounded hover:bg-indigo-700 transition"
              >
                Add Player
              </Link>
            </li>
            <li>
              <Link
                to="/admin/coin-distributor"
                className="block py-3 px-4 rounded hover:bg-indigo-700 transition"
              >
                Coin Distributor
              </Link>
            </li>
            <li>
              <Link
                to="/admin/spin-control"
                className="block py-3 px-4 rounded hover:bg-indigo-700 transition"
              >
                Spin Control
              </Link>
            </li>
            <li>
              <Link
                to="/admin/dashboard"
                className="block py-3 px-4 rounded bg-indigo-700"
              >
                Dashboard Home
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700">Total Players</h3>
            <p className="text-3xl font-bold mt-2">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-green-700">Active Players</h3>
            <p className="text-3xl font-bold mt-2">987</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-purple-700">Total Coins Distributed</h3>
            <p className="text-3xl font-bold mt-2">85,420</p>
          </div>
        </div>

        <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/add-player"
              className="bg-indigo-600 text-white py-4 px-6 rounded-lg text-center hover:bg-indigo-700 transition"
            >
              Add New Player
            </Link>
            <Link
              to="/admin/coin-distributor"
              className="bg-green-600 text-white py-4 px-6 rounded-lg text-center hover:bg-green-700 transition"
            >
              Distribute Coins
            </Link>
            <Link
              to="/admin/spin-control"
              className="bg-purple-600 text-white py-4 px-6 rounded-lg text-center hover:bg-purple-700 transition"
            >
              Control Spin
            </Link>
            <button className="bg-gray-600 text-white py-4 px-6 rounded-lg hover:bg-gray-700 transition">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;