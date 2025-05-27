import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:8080/api/v1/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      alert('Login Successful');
      navigate('/auctions');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">🔐 Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
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

export default Login;
