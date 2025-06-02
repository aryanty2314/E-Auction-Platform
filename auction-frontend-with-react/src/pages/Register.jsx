import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
  const { login, isAuthenticated, getUserRole } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      const targetPath = userRole === 'ADMIN' ? '/admin' : userRole === 'SELLER' ? '/seller' : '/auctions';
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, navigate, getUserRole]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (form.password.length < 6) {
        showToast('🔑 Password must be at least 6 characters.', 'error');
        setLoading(false);
        return;
    }
    if (!form.username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
        showToast('👤 Username must be 3-20 characters (letters, numbers, underscores).', 'error');
        setLoading(false);
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        showToast('📧 Please enter a valid email address.', 'error');
        setLoading(false);
        return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/register', form);

      if (res.data && res.data.token && res.data.username && res.data.role) {
        login({ 
          token: res.data.token,
          username: res.data.username,
          role: res.data.role,
          id: res.data.userId // Assuming backend sends userId
        });

        showToast('🎉 Registration successful! Welcome aboard!', 'success');
        setTimeout(() => {
            const targetPath = res.data.role === 'SELLER' ? '/seller' : '/auctions';
            navigate(targetPath, { replace: true });
        }, 1500);
      } else {
        throw new Error("Incomplete registration data from server.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
                           err.message ||
                           '⚠️ Registration failed. Please check details and try again.';
      showToast(errorMessage, 'error');
      console.error("Registration error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated()) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center px-4">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-xl">Redirecting...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id} // Ensure ID is passed if your Toast component uses it
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-300">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-black">
          🚀 Join Bidzy Today!
        </h2>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="usernameReg" className="block text-gray-700 text-sm font-semibold mb-1">👤 Username</label>
            <input 
              id="usernameReg"
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60 placeholder-gray-500"
              placeholder="Choose a unique username"
              autoComplete="username"
            />
          </div>
          
          <div>
            <label htmlFor="emailReg" className="block text-gray-700 text-sm font-semibold mb-1">📧 Email Address</label>
            <input 
              id="emailReg"
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60 placeholder-gray-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          
          <div>
            <label htmlFor="passwordReg" className="block text-gray-700 text-sm font-semibold mb-1">🔑 Password</label>
            <input 
              id="passwordReg"
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              minLength="6"
              disabled={loading}
              className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60 placeholder-gray-500"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>
          
          <div>
            <label htmlFor="roleReg" className="block text-gray-700 text-sm font-semibold mb-1">🎯 I want to primarily:</label>
            <select 
              id="roleReg"
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              disabled={loading}
              className="w-full px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60"
            >
              <option value="BIDDER">Bid on auctions 🙋</option>
              <option value="SELLER">Sell items in auctions 💼</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 font-semibold text-lg flex items-center justify-center shadow-md hover:shadow-lg"
          >
             {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : '✨ Create Account'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-700">
            Already have an account?{' '}
            <Link 
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;