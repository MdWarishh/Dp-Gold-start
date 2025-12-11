// src/components/AddPlayer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPlayer = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const config = {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      };

      const res = await axios.post(
        'https://dp-gold-backend.onrender.com/api/admin/add-player',
        { fullName, username, password, status },
        config
      );

      setMessage(res.data.message || 'Player added successfully!');
      
      // Auto-clear form on success
      setFullName('');
      setUsername('');
      setPassword('');
      setStatus('active');

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add player';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Reuse same style as Dashboard */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">Admin Panel</div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button className="w-full text-left py-3 px-4 rounded bg-indigo-700">
                Add Player
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/admin/coin-distributor')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">
                Coin Distributor
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/admin/spin-control')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">
                Spin Control
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/admin/dashboard')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">
                Dashboard
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/admin/login');
            }}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Add New Player</h1>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="johndoe123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 text-white font-semibold rounded-lg transition ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                }`}
              >
                {loading ? 'Adding Player...' : 'Add Player'}
              </button>
            </form>

            {/* Success / Error Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                message.includes('success') || message.includes('added')
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlayer;