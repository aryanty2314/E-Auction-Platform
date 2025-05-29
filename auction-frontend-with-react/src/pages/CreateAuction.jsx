import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function CreateAuction() {
  const [auction, setAuction] = useState({
    title: '',
    description: '',
    startPrice: '', // Should be a number, but input type="number" handles this
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuction({ 
      ...auction, 
      [name]: name === 'startPrice' ? (value === '' ? '' : parseFloat(value)) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.token) {
      showToast('Authentication required to create an auction.', 'error');
      setLoading(false);
      return;
    }

    if (auction.startPrice <= 0) {
      showToast('Starting price must be greater than 0.', 'error');
      setLoading(false);
      return;
    }
    
    try {
      // The backend should associate this auction with the logged-in seller via the token
      await axios.post('http://localhost:8080/api/v1/auction', auction, {
        headers: {
          Authorization: `Bearer ${user.token}` // user.token is fine after check
        }
      });
      
      showToast('Auction created successfully!', 'success');
      setTimeout(() => {
        navigate('/seller'); // Navigate to seller dashboard or auctions list
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create auction. Please try again.';
      showToast(errorMessage, 'error');
      console.error("Error creating auction:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white flex items-center justify-center px-4 py-8">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          🎯 Create New Auction
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-300 text-sm font-medium mb-2">Auction Title</label>
            <input 
              id="title"
              name="title" 
              placeholder="e.g., Vintage Rolex Watch" 
              required 
              value={auction.title} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-2">Description</label>
            <textarea 
              id="description"
              name="description" 
              placeholder="Detailed description of the item, its condition, etc." 
              required 
              value={auction.description} 
              onChange={handleChange}
              disabled={loading}
              rows="4"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="startPrice" className="block text-gray-300 text-sm font-medium mb-2">Starting Price (₹)</label>
            <input 
              id="startPrice"
              type="number" 
              name="startPrice" 
              placeholder="e.g., 5000" 
              required 
              min="1" // HTML5 validation for minimum value
              value={auction.startPrice} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-gray-300 text-sm font-medium mb-2">Image URL (Optional)</label>
            <input 
              id="imageUrl"
              type="url"
              name="imageUrl" 
              placeholder="https://example.com/image.jpg" 
              value={auction.imageUrl} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate(-1)} // Go back to the previous page
              disabled={loading}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAuction;