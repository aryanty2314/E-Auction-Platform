import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigate                = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('role',     res.data.role);
      localStorage.setItem('username', res.data.username);
      navigate('/auctions');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-gray-900 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">🔐 Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{' '}
          <a href="/register" className="text-green-400 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
