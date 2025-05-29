import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function SellerDashboard() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchMyAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/auctions/my', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setAuctions(res.data);
      } catch (err) {
        const errorMessage = err.response?.status === 401 
          ? 'Please log in to view your auctions' 
          : 'Failed to fetch your auctions. Please try again.';
        showToast(errorMessage, 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchMyAuctions();
    } else {
      setLoading(false);
    }
  }, [user?.token, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading your auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6 py-8">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            📦 My Auctions
          </h1>
          <button
            onClick={() => navigate('/create-auction')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Create New Auction
          </button>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">No Auctions Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start your selling journey by creating your first auction. It's quick and easy!
            </p>
            <button
              onClick={() => navigate('/create-auction')}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Auction
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-400">
                You have <span className="text-green-400 font-semibold">{auctions.length}</span> active auction{auctions.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions.map((auction) => (
                <div key={auction.id} className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={auction.imageUrl || 'https://via.placeholder.com/400x200?text=Your+Auction'} 
                      className="h-48 w-full object-cover hover:scale-110 transition-transform duration-300" 
                      alt={auction.title} 
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      ACTIVE
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{auction.title}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-2">{auction.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Current Price:</span>
                      <span className="text-lg font-bold text-green-400">
                        ₹{auction.currentPrice || auction.startPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Starting Price:</span>
                      <span className="text-sm text-gray-300">₹{auction.startPrice}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;