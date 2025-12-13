// src/components/AddPlayer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPlayer = () => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  
  // UI State
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]); // 👈 NEW: State to store player list

  const navigate = useNavigate();

  // Define API URL (Live)
  const API_BASE = 'https://dp-gold-backend.onrender.com';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    } else {
      fetchPlayers(); // 👈 Fetch players when page loads
    }
  }, [navigate]);

  // 👇 NEW: Function to get all players
  const fetchPlayers = async () => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      const res = await axios.get(`${API_BASE}/api/admin/players`, config);
      setPlayers(res.data.data); // Store the list in state
    } catch (err) {
      console.error("Failed to fetch players", err);
    }
  };



  // 👇 NEW: Handle Status Change from Table
  const handleStatusChange = async (playerId, newStatus) => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      
      // Call the API
      await axios.post(
        `${API_BASE}/api/admin/update-player-status`,
        { playerId, status: newStatus },
        config
      );

      // Refresh list to show updates
      fetchPlayers();
      setMessage(`Player status updated to ${newStatus}`);
      setTimeout(() => setMessage(''), 3000); // Hide message after 3s

    } catch (err) {
      alert('Failed to update status');
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };

      const res = await axios.post(
        `${API_BASE}/api/admin/add-player`,
        { fullName, username, password, status },
        config
      );

      setMessage(res.data.message || 'Player added successfully!');
      
      // Auto-clear form
      setFullName('');
      setUsername('');
      setPassword('');
      setStatus('active');

      // 👇 REFRESH THE TABLE INSTANTLY
      fetchPlayers(); 

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add player';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">Admin Panel</div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li><button className="w-full text-left py-3 px-4 rounded bg-indigo-700">Add Player</button></li>
            <li><button onClick={() => navigate('/admin/coin-distributor')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Coin Distributor</button></li>
            <li><button onClick={() => navigate('/admin/spin-control')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Spin Control</button></li>
            <li><button onClick={() => navigate('/admin/dashboard')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Dashboard</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded transition">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Player Management</h1>

          {/* ADD PLAYER FORM */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Add New Player</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="username123"
                  required
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 text-white font-bold text-lg rounded-lg transition ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md'
                  }`}
                >
                  {loading ? 'Processing...' : '+ Create Player Account'}
                </button>
              </div>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center font-bold ${
                message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* 👇 NEW SECTION: PLAYERS LIST TABLE */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 flex justify-between items-center">
              <span>Registered Players</span>
              <span className="text-sm font-normal bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">Total: {players.length}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">
                        No players found. Add one above!
                      </td>
                    </tr>
                  ) : (
                    players.map((player) => (
                      <tr key={player._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{player.sNo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{player.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {player.username}
                          </span>
                        </td>
                       <td className="px-6 py-4">
                        <select
                          value={player.status}
                          onChange={(e) => handleStatusChange(player._id, e.target.value)}
                          className={`text-sm font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${
                            player.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-600">
                          {player.coins || 0} 🪙
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddPlayer;