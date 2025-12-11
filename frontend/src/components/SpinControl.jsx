// src/components/SpinControl.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SpinControl = () => {
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/admin/login');
    } else {
      fetchCurrentNumber();
    }
  }, [navigate]);

  const fetchCurrentNumber = async () => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      const res = await axios.get('https://dp-gold-backend.onrender.com/api/admin/public/target', config);
      setCurrentNumber(res.data.target_number);
      setSelectedNumber(res.data.target_number);
    } catch (err) {
      setMessage('Failed to load current number');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      await axios.post('https://dp-gold-backend.onrender.com/api/admin/set-target', { number: selectedNumber }, config);
      setCurrentNumber(selectedNumber);
      setMessage('Target number updated successfully!');
    } catch (err) {
      setMessage('Failed to update');
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

      {/* Main */}
      <div className="flex-1 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-10">Spin Wheel Target Control</h1>

          <div className="bg-white rounded-2xl shadow-2xl p-10">
            <div className="text-center mb-10">
              <p className="text-2xl text-gray-600 mb-4">Current Target Number</p>
              <div className="text-9xl font-bold text-indigo-600">{currentNumber !== null ? currentNumber : "-"}</div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-10">
              {[0,1,2,3,4,5,6,7,8,9].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedNumber(num)}
                  className={`py-8 text-4xl font-bold rounded-2xl transition transform hover:scale-110 ${
                    selectedNumber === num
                      ? 'bg-indigo-600 text-white shadow-2xl'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || selectedNumber === currentNumber}
              className={`w-full py-6 text-3xl font-bold rounded-2xl transition ${
                loading || selectedNumber === currentNumber
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl'
              }`}
            >
              {loading ? 'Saving...' : 'SET TARGET NUMBER'}
            </button>

            {message && (
              <div className={`mt-8 p-6 text-2xl text-center font-bold rounded-2xl border-4 ${
                message.includes('success')
                  ? 'bg-green-100 text-green-800 border-green-500'
                  : 'bg-red-100 text-red-800 border-red-500'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-10 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl text-center">
              <p className="text-lg font-semibold text-yellow-800">
                Unity URL: <code className="bg-yellow-200 px-3 py-1 rounded">https://dpgoldstar.free.nf/get_target_number.php</code>
              </p>
              <p className="text-sm text-yellow-700 mt-2">Returns: {`{ "target_number": ${selectedNumber} }`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinControl;