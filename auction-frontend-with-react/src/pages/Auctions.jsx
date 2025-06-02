import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!user?.token) {
        showToast('🔒 Please log in to view auctions.', 'error');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8080/api/v1/auction/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAuctions(res.data || []); // Ensure auctions is an array
      } catch (err) {
        const errorMessage = err.response?.status === 401 || err.response?.status === 403
          ? '🚫 Please log in to view auctions or your session has expired.' 
          : '⚠️ Failed to fetch auctions. Please try again.';
        showToast(errorMessage, 'error');
        console.error("Error fetching auctions:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [user?.token, showToast, navigate]);

  const handlePlaceBid = (auctionId) => {
    navigate(`/auction/${auctionId}/bid`);
  };
  
  const handleViewLiveAuction = (auctionId) => {
    navigate(`/live/${auctionId}`);
  };


  if (loading && !user) { // Only show full page loader if user is not determined yet
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">⏳ Loading Auctions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-10">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">
          🏛️ Live & Upcoming Auctions
        </h1>
        
        {!user && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-8">Please log in to explore the marketplace.</p>
            <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                🔑 Login
            </button>
          </div>
        )}

        {user && auctions.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏜️</div>
            <h2 className="text-2xl font-semibold mb-4">No Auctions Found</h2>
            <p className="text-gray-400 mb-8">It's a bit quiet here. Check back soon!</p>
            {user.role === 'SELLER' && (
                <button 
                    onClick={() => navigate('/create-auction')} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                    ✨ Create First Auction
                </button>
            )}
          </div>
        )}

        {user && auctions.length > 0 && (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {auctions.map((auction) => (
              <div 
                key={auction.id} 
                className="bg-gray-900 border border-gray-700 p-5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:border-blue-500 transform hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-lg mb-4 h-52">
                    <img 
                      src={auction.imageUrl || `https://via.placeholder.com/400x200/000000/FFFFFF?text=${encodeURIComponent(auction.title.substring(0,15))}`} 
                      alt={auction.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200/000000/FFFFFF?text=🖼️'; }}
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold border ${
                      auction.active 
                        ? 'bg-blue-500 text-white border-blue-400' 
                        : 'bg-gray-700 text-gray-300 border-gray-600'
                    }`}>
                      {auction.active ? '🟢 LIVE' : '⚪ ENDED'}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 text-white truncate" title={auction.title}>{auction.title}</h2>
                  <p className="text-gray-300 mb-4 line-clamp-3 text-sm" title={auction.description}>{auction.description || "No description."}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Starts At</p>
                      <p className="text-md font-semibold text-gray-200">
                        ₹{auction.startPrice}
                      </p>
                    </div>
                     <div>
                      <p className="text-xs text-blue-400">Current Bid</p>
                      <p className="text-lg font-bold text-blue-300">
                        ₹{auction.currentPrice || auction.startPrice}
                      </p>
                    </div>
                  </div>
                  {auction.active ? (
                    <>
                    <button 
                      onClick={() => handlePlaceBid(auction.id)} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium mb-2 shadow hover:shadow-lg"
                    >
                      💸 Place Bid
                    </button>
                    <button 
                      onClick={() => handleViewLiveAuction(auction.id)} 
                      className="w-full bg-black hover:bg-gray-800 text-white border border-blue-500 px-4 py-2.5 rounded-lg transition-colors font-medium shadow hover:shadow-lg"
                    >
                      👀 View Live
                    </button>
                    </>
                  ) : (
                     <button 
                      disabled
                      className="w-full bg-gray-700 text-gray-500 px-4 py-2.5 rounded-lg font-medium cursor-not-allowed"
                    >
                      Bidding Ended
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