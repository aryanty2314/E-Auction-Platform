import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/auction/all', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setAuctions(res.data);
      } catch (err) {
        const errorMessage = err.response?.status === 401 
          ? 'Please log in to view auctions' 
          : 'Failed to fetch auctions. Please try again.';
        showToast(errorMessage, 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAuctions();
    } else {
      setLoading(false);
    }
  }, [user?.token, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white px-8 py-10">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🔥 Live Auctions
        </h1>
        
        {auctions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">No Active Auctions</h2>
            <p className="text-gray-400 mb-8">Be the first to create an exciting auction!</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={auction.imageUrl || 'https://via.placeholder.com/400x200?text=Auction+Item'} 
                    alt={auction.title} 
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    LIVE
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-white">{auction.title}</h2>
                <p className="text-gray-300 mb-4 line-clamp-2">{auction.description}</p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-2xl font-bold text-green-400">
                      ₹{auction.currentPrice || auction.startPrice}
                    </p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Auctions