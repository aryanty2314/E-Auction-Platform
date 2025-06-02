import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useToast as useAppToast } from '../hooks/useToast';

function PlaceBid() {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useAppToast();
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      if (!user?.token) {
        showToast('🔒 Please log in to place a bid.', 'error');
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (response.data) {
          setAuction(response.data);
          const minBid = (parseFloat(response.data.currentPrice || response.data.startPrice) + 1);
          setAmount(minBid > 0 ? minBid.toString() : "1");
        } else {
          showToast('⚠️ Auction not found.', 'error');
          navigate('/auctions', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
        showToast(
          error.response?.data?.message || '⚠️ Failed to load auction details.',
          'error'
        );
        navigate('/auctions', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId, user?.token, showToast, navigate]);

  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!auction || !user?.token || !user?.id) { // Ensure user.id is available
      showToast('🚫 Cannot place bid. Auction/user data missing or user ID not found.', 'error');
      return;
    }
    
    const bidAmount = parseFloat(amount);
    const currentPrice = parseFloat(auction.currentPrice || auction.startPrice);
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
      showToast('💰 Please enter a valid positive bid amount.', 'error');
      return;
    }

    if (bidAmount <= currentPrice) {
      showToast(`📈 Bid must be higher than current price of ₹${currentPrice.toFixed(2)}`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const bidRequest = {
        amount: bidAmount,
        auctionId: parseInt(auctionId),
        // userId: user.id // Backend should get user ID from token for security
      };

      // This POST might be redundant if WebSocket handles bid submissions.
      // If WebSocket is primary, this could be removed or be a fallback.
      await axios.post('http://localhost:8080/api/v1/bids', bidRequest, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      showToast('✅ Bid placed successfully! Redirecting to live view...', 'success');
      
      // Optimistic update for UI (actual update should come via WebSocket if implemented)
      setAuction(prev => ({ ...prev, currentPrice: bidAmount }));
      setAmount((bidAmount + 1).toString()); // Suggest next bid
      
      setTimeout(() => {
        navigate(`/live/${auctionId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error placing bid:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          '❌ Failed to place bid. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(auction ? `/live/${auction.id}` : '/auctions');
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>⏳ Loading Auction Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 sm:p-6">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
      <div className="bg-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">💰 Place Your Bid</h2>
          <button
            onClick={handleGoBack}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Auction
          </button>
        </div>

        {auction ? (
          <>
            <div className="mb-6 p-4 bg-black rounded-lg border border-gray-700">
              {auction.imageUrl && (
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="w-full h-48 sm:h-64 object-contain rounded-md mb-4 bg-gray-800"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x200/000000/FFFFFF?text=${encodeURIComponent(auction.title.substring(0,15)) || '🖼️'}`;
                  }}
                />
              )}
              <h3 className="text-xl font-semibold text-white mb-1 truncate" title={auction.title}>{auction.title}</h3>
              <p className="text-sm text-gray-300 mb-1 line-clamp-2">{auction.description}</p>
              <p className="text-xs text-gray-400">Starting Price: ₹{auction.startPrice.toFixed(2)}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">
                Current Bid: ₹{(auction.currentPrice || auction.startPrice).toFixed(2)}
              </p>
              <p className={`text-sm font-semibold mt-1 ${auction.active ? 'text-blue-400' : 'text-red-500'}`}>
                Status: {auction.active ? '🟢 Active' : '⚪ Ended'}
              </p>
            </div>

            {auction.active ? (
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Bid (Min: ₹{(parseFloat(auction.currentPrice || auction.startPrice) + 0.01).toFixed(2)})
                  </label>
                  <input
                    id="bidAmount"
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter bid amount"
                    className="w-full px-4 py-3 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg disabled:opacity-60 placeholder-gray-500"
                    value={amount}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting || !auction.active}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3.5 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center shadow-md"
                >
                  {submitting ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    🚀 Submitting...
                    </>
                  ) : '🚀 Submit Bid'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-500 mb-4">🚫 This auction is no longer active for bidding.</p>
                <button
                  onClick={handleGoBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium"
                >
                  ← View Auction
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">⚠️ Auction details could not be loaded.</p>
            <button
              onClick={() => navigate('/auctions')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium"
            >
              ← Back to Auctions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceBid;