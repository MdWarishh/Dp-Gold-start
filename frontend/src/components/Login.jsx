import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://dp-gold-backend.onrender.com/api/admin/login', { username, password });
      localStorage.setItem('token', res.data.data.token);
      setMessage('Login successful! Redirecting...');
      // Redirect to dashboard or add-player
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 w-full" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" required />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Login</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default Login;