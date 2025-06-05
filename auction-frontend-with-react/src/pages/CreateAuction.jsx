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
    startPrice: '',
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
      [name]: name === 'startPrice' ? value : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.token) {
      showToast('🔒 Authentication required.', 'error');
      setLoading(false);
      navigate('/login');
      return;
    }

    // Validation
    if (!auction.title.trim()) {
      showToast('✏️ Title is required.', 'error');
      setLoading(false);
      return;
    }
    if (!auction.description.trim()) {
      showToast('📝 Description is required.', 'error');
      setLoading(false);
      return;
    }
    if (!auction.startPrice || parseFloat(auction.startPrice) <= 0) {
      showToast('💰 Starting price must be greater than 0.', 'error');
      setLoading(false);
      return;
    }
    
    try {
      // Prepare request data - send startPrice as number
      const requestData = {
        title: auction.title.trim(),
        description: auction.description.trim(),
        startPrice: parseFloat(auction.startPrice),
        imageUrl: auction.imageUrl.trim() || null
      };

      console.log('Sending auction data:', requestData);

      const response = await axios.post('http://localhost:8080/api/v1/auction', requestData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auction created successfully:', response.data);
      showToast('✅ Auction created successfully! Redirecting to your dashboard...', 'success');
      
      setTimeout(() => {
        navigate('/seller'); 
      }, 1500);
    } catch (err) {
      console.error("Error creating auction:", err);
      
      let errorMessage = '⚠️ Failed to create auction. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = '🔒 Authentication expired. Please log in again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        errorMessage = '🚫 You need seller privileges to create auctions.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-4 py-12">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ✨ Create New Auction
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-300 text-sm font-medium mb-2">
              ✏️ Auction Title
            </label>
            <input 
              id="title"
              name="title" 
              type="text"
              placeholder="e.g., Vintage Pocket Watch Collection" 
              required 
              value={auction.title} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-2">
              📝 Description
            </label>
            <textarea 
              id="description"
              name="description" 
              placeholder="Provide detailed description of the item including condition, age, and special features..." 
              required 
              value={auction.description} 
              onChange={handleChange}
              disabled={loading}
              rows="4"
              className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 resize-none placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label htmlFor="startPrice" className="block text-gray-300 text-sm font-medium mb-2">
              💰 Starting Price (₹)
            </label>
            <input 
              id="startPrice"
              type="number" 
              name="startPrice" 
              placeholder="1000" 
              required 
              min="1"
              step="0.01"
              value={auction.startPrice} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-gray-300 text-sm font-medium mb-2">
              🖼️ Image URL (Optional)
            </label>
            <input 
              id="imageUrl"
              type="url"
              name="imageUrl" 
              placeholder="https://example.com/your-item-image.jpg" 
              value={auction.imageUrl} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/seller')}
              disabled={loading}
              className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all font-medium disabled:opacity-50 border border-gray-600 backdrop-blur-sm"
            >
              ↩️ Back to Dashboard
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : '🚀 Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAuction;