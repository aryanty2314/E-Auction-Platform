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
    setAuction({ ...auction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:8080/api/v1/auction', auction, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      showToast('Auction created successfully!', 'success');
      setTimeout(() => {
        navigate('/seller');
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create auction. Please try again.';
      showToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white flex items-center justify-center px-4">
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
            <label className="block text-gray-300 text-sm font-medium mb-2">Auction Title</label>
            <input 
              name="title" 
              placeholder="Enter auction title" 
              required 
              value={auction.title} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
            <textarea 
              name="description" 
              placeholder="Describe your item..." 
              required 
              value={auction.description} 
              onChange={handleChange}
              disabled={loading}
              rows="4"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Starting Price (₹)</label>
            <input 
              type="number" 
              name="startPrice" 
              placeholder="0" 
              required 
              min="1"
              value={auction.startPrice} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Image URL (optional)</label>
            <input 
              name="imageUrl" 
              placeholder="https://example.com/image.jpg" 
              value={auction.imageUrl} 
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate('/seller')}
              disabled={loading}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAuction;