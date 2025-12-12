// src/components/SpinControl.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SpinControl = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // CHANGE THIS TO YOUR RENDER URL BEFORE DEPLOYING
//   const API_BASE = 'http://localhost:5000'; 
  const API_BASE = 'https://dp-gold-backend.onrender.com';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      
      // Get History to determine current state
      const resHistory = await axios.get(`${API_BASE}/api/admin/target-history`, config);
      
      if (resHistory.data.data.length > 0) {
        const latestSetting = resHistory.data.data[0].number;
        setCurrentNumber(latestSetting);
        
        // If the latest is -1 (Random), don't pre-select any number button
        // If it is 0-9, pre-select it so you know what is active
        if (latestSetting !== -1) {
          setSelectedNumber(latestSetting);
        } else {
          setSelectedNumber(null);
        }
        
        setHistory(resHistory.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (config) => {
    try {
      const resHistory = await axios.get(`${API_BASE}/api/admin/target-history`, config);
      setHistory(resHistory.data.data);
    } catch (err) { console.error(err); }
  };

  const handleNumberClick = (num) => {
    // Simple selection - No toggling, no deselection
    setSelectedNumber(num);
  };

  const handleSubmit = async () => {
    if (selectedNumber === null) {
      setMessage("Please select a number first.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      
      // Send the specific number (0-9)
      await axios.post(`${API_BASE}/api/admin/set-target`, { number: selectedNumber }, config);
      
      setCurrentNumber(selectedNumber);
      setMessage(`Next Spin Target: ${selectedNumber}`);
      
      fetchHistory(config);
    } catch (err) {
      setMessage('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">Admin Panel</div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li><button onClick={() => navigate('/admin/add-player')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700">Add Player</button></li>
            <li><button onClick={() => navigate('/admin/coin-distributor')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700">Coin Distributor</button></li>
            <li><button className="w-full text-left py-3 px-4 rounded bg-indigo-700">Spin Control</button></li>
            <li><button onClick={() => navigate('/admin/dashboard')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700">Dashboard</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-700">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Spin Control</h1>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-8">
                <p className="text-xl text-gray-500 mb-2">Current System State</p>
                
                {/* LOGIC: 
                   If -1, System is in Random Mode (Waiting for next spin).
                   If 0-9, System is "Loaded" with a target for the NEXT spin only.
                */}
                {currentNumber === -1 ? (
                  <div className="flex flex-col items-center justify-center h-32">
                     <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 animate-pulse">
                       AUTO RANDOM 🎲
                     </span>
                     <p className="text-gray-400 text-sm mt-2">System generating random numbers automatically</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="text-8xl font-black text-indigo-600 drop-shadow-lg">
                      {currentNumber !== null ? currentNumber : "-"}
                    </div>
                    <p className="text-indigo-600 font-bold mt-2">LOCKED FOR NEXT SPIN</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-3 mb-8">
                {[0,1,2,3,4,5,6,7,8,9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className={`py-6 text-3xl font-bold rounded-xl transition transform hover:scale-105 ${
                      selectedNumber === num
                        ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || selectedNumber === null}
                className={`w-full py-5 text-2xl font-bold rounded-xl transition shadow-lg ${
                  loading || selectedNumber === null
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                {loading ? 'Saving...' : 'SET ONE-TIME TARGET'}
              </button>
              
              {message && (
                <div className={`mt-6 p-4 text-center font-bold rounded-xl ${
                    message.includes('success') || message.includes('Target') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                    {message}
                </div>
              )}
            </div>
          </div>

        {/* ... inside SpinControl.jsx ... */}

{/* History Column */}
<div className="w-full lg:w-96">
  <h2 className="text-2xl font-bold text-gray-700 mb-6">Spin History</h2>
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-h-[600px] overflow-y-auto">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history
            .filter(item => item.number !== -1) // 👈 THIS LINE FIXES IT (Removes Reset/Random rows)
            .map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                    {/* Now we only show actual numbers */}
                    <span className="font-bold text-xl w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full border border-gray-200">
                      {item.number}
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      
      {/* Optional: Show empty state if everything is filtered out */}
      {history.filter(item => item.number !== -1).length === 0 && (
        <div className="p-8 text-center text-gray-400 text-sm">
          No spin results yet.
        </div>
      )}
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default SpinControl;