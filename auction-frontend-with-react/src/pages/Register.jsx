import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'BIDDER'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/register', form);

      login({
        token: res.data.token,
        username: res.data.username,
        role: res.data.role
      });

      showToast('Registration successful! Welcome to AuctionHub!', 'success');
      setTimeout(() => navigate('/auctions'), 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Join AuctionHub</h2>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Choose a username"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Create a password"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">I want to</label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            >
              <option value="BIDDER">Bid on auctions</option>
              <option value="SELLER">Sell items</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;