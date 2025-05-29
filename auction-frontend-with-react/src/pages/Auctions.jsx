import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!user?.token) {
        showToast('Please log in to view auctions.', 'error');
        setLoading(false); // Stop loading if no token
        // Optionally redirect to login after a delay
        // setTimeout(() => navigate('/login'), 2000);
        return;
      }
      try {
        setLoading(true); // Set loading true at the start of fetch attempt
        const res = await axios.get('http://localhost:8080/api/v1/auction/all', {
          headers: { Authorization: `Bearer ${user.token}` }, // user.token is fine after check
        });
        setAuctions(res.data);
      } catch (err) {
        const errorMessage = err.response?.status === 401 || err.response?.status === 403
          ? 'Please log in to view auctions or your session has expired.' 
          : 'Failed to fetch auctions. Please try again.';
        showToast(errorMessage, 'error');
        console.error("Error fetching auctions:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [user?.token, showToast, navigate]); // Added navigate and showToast to dependencies

  const handlePlaceBid = (auctionId) => {
    navigate(`/auction/${auctionId}/bid`);
  };
  
  const handleViewLiveAuction = (auctionId) => {
    navigate(`/live/${auctionId}`);
  };


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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white px-4 sm:px-8 py-10">
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
          🔥 Live & Upcoming Auctions
        </h1>
        
        {!user && !loading && ( // Message if user is not logged in and not loading
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">Access Denied</h2>
            <p className="text-gray-400 mb-8">Please log in to view available auctions.</p>
            <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
              >
                Login
            </button>
          </div>
        )}

        {user && auctions.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">No Active Auctions Found</h2>
            <p className="text-gray-400 mb-8">Check back soon or be the first to create one if you're a seller!</p>
            {/* Optionally, a button to create auction for sellers */}
          </div>
        )}

        {user && auctions.length > 0 && (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {auctions.map((auction) => (
              <div 
                key={auction.id} 
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-lg mb-4 h-48">
                    <img 
                      src={auction.imageUrl || 'https://via.placeholder.com/400x200?text=Auction+Item'} 
                      alt={auction.title} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
                    />
                    {auction.active && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        LIVE
                      </div>
                    )}
                     {!auction.active && (
                      <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        INACTIVE
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 text-white truncate" title={auction.title}>{auction.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3" title={auction.description}>{auction.description}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Start Price</p>
                      <p className="text-lg font-bold text-gray-200">
                        ₹{auction.startPrice}
                      </p>
                    </div>
                     <div>
                      <p className="text-sm text-green-400">Current Price</p>
                      <p className="text-xl font-bold text-green-300">
                        ₹{auction.currentPrice || auction.startPrice}
                      </p>
                    </div>
                  </div>
                  {auction.active ? (
                    <button 
                      onClick={() => handlePlaceBid(auction.id)} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Place Bid
                    </button>
                  ) : (
                     <button 
                      disabled
                      className="w-full bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                      Bidding Ended
                    </button>
                  )}
                   {/* Button to view live auction page if active */}
                  {auction.active && (
                    <button 
                      onClick={() => handleViewLiveAuction(auction.id)} 
                      className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      View Live Bids
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Auctions;