// src/components/SpinControl.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SpinControl = () => {
  const [selectedNumber, setSelectedNumber] = useState(null); // Changed default to null
  const [currentNumber, setCurrentNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Switch to your API
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
      
      // We check HISTORY to see what the Admin actually set (because public API returns random now)
      const resHistory = await axios.get(`${API_BASE}/api/admin/target-history`, config);
      
      if (resHistory.data.data.length > 0) {
        const latestSetting = resHistory.data.data[0].number;
        setCurrentNumber(latestSetting);
        setSelectedNumber(latestSetting);
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
    // If clicking the same number, toggle to -1 (Random)
    if (selectedNumber === num) {
      setSelectedNumber(-1);
    } else {
      setSelectedNumber(num);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      
      // Send selected number (0-9) OR -1 for Random
      await axios.post(`${API_BASE}/api/admin/set-target`, { number: selectedNumber }, config);
      
      setCurrentNumber(selectedNumber);
      setMessage(selectedNumber === -1 ? 'Switched to Random Mode!' : 'Target updated successfully!');
      
      fetchHistory(config);
    } catch (err) {
      setMessage('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Same as before) */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700">Admin Panel</div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li><button onClick={() => navigate('/admin/dashboard')} className="w-full text-left py-3 px-4 rounded hover:bg-indigo-700">Dashboard</button></li>
             {/* ... other links ... */}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Spin Control</h1>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center mb-8">
                <p className="text-xl text-gray-500 mb-2">Current Status</p>
                {/* DISPLAY LOGIC FOR RANDOM MODE */}
                {currentNumber === -1 ? (
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse py-4">
                    RANDOM 🎲
                  </div>
                ) : (
                  <div className="text-8xl font-black text-indigo-600 drop-shadow-lg">
                    {currentNumber !== null ? currentNumber : "-"}
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

              {/* Explicit Random Button */}
              <button
                onClick={() => setSelectedNumber(-1)}
                className={`w-full mb-4 py-4 font-bold rounded-xl border-2 transition ${
                    selectedNumber === -1 
                    ? 'bg-purple-100 border-purple-500 text-purple-700' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                🎲 Select Random / Unset Target
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-5 text-2xl font-bold rounded-xl transition shadow-lg ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                {loading ? 'Saving...' : 'UPDATE GAME MODE'}
              </button>
              
              {message && (
                <div className="mt-4 text-center font-bold text-green-600">{message}</div>
              )}
            </div>
          </div>

          {/* History Column (Same as before, displays -1 as "Random") */}
          <div className="w-full lg:w-96">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Recent Changes</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
               <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    {history.map((item, index) => (
                      <tr key={item._id} className={index === 0 ? "bg-green-50" : ""}>
                        <td className="px-6 py-4">
                          {item.number === -1 ? (
                             <span className="font-bold text-purple-600 text-sm">🎲 RANDOM</span>
                          ) : (
                             <span className="font-bold text-xl">{item.number}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpinControl;