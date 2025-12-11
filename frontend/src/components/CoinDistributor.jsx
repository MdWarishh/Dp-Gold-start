// src/components/CoinDistributor.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoinDistributor = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [coinAmount, setCoinAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    } else {
      fetchPlayers();
    }
  }, [navigate]);

  const fetchPlayers = async () => {
    setFetching(true);
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      const res = await axios.get('http://localhost:5000/api/admin/players', config);
      // The backend now returns 'coins' directly in the player object
      setPlayers(res.data.data || []);
    } catch (err) {
      setMessage('Failed to load players');
    } finally {
      setFetching(false);
    }
  };

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === filteredPlayers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(filteredPlayers.map(p => p._id));
    }
  };

  const filteredPlayers = players.filter(player =>
    player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDistribute = async () => {
    if (selectedPlayers.length === 0) {
      setMessage('Please select at least one player');
      return;
    }
    if (!coinAmount || isNaN(coinAmount)) {
      setMessage('Please enter a valid coin amount');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      // Send updates for all selected players
      const promises = selectedPlayers.map(playerId =>
        axios.post(
          'http://localhost:5000/api/admin/update-coins',
          { playerId, coins: Number(coinAmount) },
          config
        )
      );

      await Promise.all(promises);
      
      setMessage(`Successfully distributed ${Math.abs(coinAmount)} coins to ${selectedPlayers.length} players!`);
      setSelectedPlayers([]);
      setCoinAmount('');
      
      // Refresh the list immediately to show new balances
      fetchPlayers(); 
    } catch (err) {
      console.error(err);
      setMessage('Failed to distribute coins');
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
            <li><button onClick={() => navigate('/admin/add-player')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Add Player</button></li>
            <li><button className="w-full text-left py-3 px-4 rounded bg-indigo-700">Coin Distributor</button></li>
            <li><button onClick={() => navigate('/admin/spin-control')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Spin Control</button></li>
            <li><button onClick={() => navigate('/admin/dashboard')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700 transition">Dashboard</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-10">Coin Distributor</h1>

          {/* Bulk Distribution Panel */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-8 mb-10">
            <h2 className="text-3xl font-bold mb-6">Bulk Coin Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg mb-3">Coin Amount</label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="e.g. 10000 or -5000"
                  className="w-full px-6 py-4 rounded-xl text-black text-xl font-bold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleDistribute}
                  disabled={loading || selectedPlayers.length === 0}
                  className={`w-full py-5 px-8 text-2xl font-bold rounded-xl transition ${
                    loading || selectedPlayers.length === 0
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-xl'
                  }`}
                >
                  {loading ? 'Distributing...' : `Distribute to ${selectedPlayers.length} Players`}
                </button>
              </div>
              <div className="flex items-end justify-end">
                <div className="text-right">
                  <p className="text-sm opacity-90">Selected Players</p>
                  <p className="text-5xl font-bold">{selectedPlayers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Select All */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-lg"
            />
            <button
              onClick={handleSelectAll}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
            >
              {selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0
                ? 'Deselect All'
                : 'Select All Visible'}
            </button>
          </div>

          {/* Players Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {fetching ? (
              <div className="p-20 text-center text-gray-500 text-xl">Loading players...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="p-20 text-center text-gray-500 text-xl">No players found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700">Name</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700">Username</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700">Coins</th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map(player => (
                      <tr key={player._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-5">
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player._id)}
                            onChange={() => handleSelectPlayer(player._id)}
                            className="w-5 h-5 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-5 font-medium">{player.fullName}</td>
                        <td className="px-6 py-5 text-gray-600">@{player.username}</td>
                        <td className="px-6 py-5 font-bold text-xl text-green-600">
                           {/* FIXED: Accessed 'coins' directly from player object */}
                          {player.coins?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            player.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {player.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-10 p-8 rounded-2xl text-center text-2xl font-bold border-4 ${
              message.includes('success') || message.includes('distributed')
                ? 'bg-green-100 text-green-800 border-green-500'
                : 'bg-red-100 text-red-800 border-red-500'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDistributor;