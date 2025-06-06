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
      
      if (!auctionId) {
        showToast('⚠️ Invalid auction ID.', 'error');
        navigate('/auctions', { replace: true });
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching auction with ID: ${auctionId}`);
        
        const response = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Auction response:', response.data);
        
        if (response.data) {
          setAuction(response.data);
          // Set minimum bid amount
          const currentPrice = parseFloat(response.data.currentPrice || response.data.startPrice);
          const minBid = currentPrice + 1;
          setAmount(minBid.toString());
        } else {
          showToast('⚠️ Auction not found.', 'error');
          navigate('/auctions', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
        
        let errorMessage = '⚠️ Failed to load auction details.';
        
        if (error.response?.status === 401) {
          errorMessage = '🔒 Authentication expired. Please log in again.';
          navigate('/login', { replace: true });
        } else if (error.response?.status === 404) {
          errorMessage = '⚠️ Auction not found.';
          navigate('/auctions', { replace: true });
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        showToast(errorMessage, 'error');
        
        // Only navigate away if it's a critical error
        if (error.response?.status === 404 || error.response?.status === 401) {
          setTimeout(() => {
            navigate('/auctions', { replace: true });
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId, user?.token, showToast, navigate]);

  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!auction || !user?.token) {
      showToast('🚫 Cannot place bid. Missing auction or authentication data.', 'error');
      return;
    }

    // Check if auction is still active
    if (!auction.active) {
      showToast('🚫 This auction is no longer active.', 'error');
      return;
    }
    
    const bidAmount = parseFloat(amount);
    const currentPrice = parseFloat(auction.currentPrice || auction.startPrice);
    
    // Validation
    if (isNaN(bidAmount) || bidAmount <= 0) {
      showToast('💰 Please enter a valid positive bid amount.', 'error');
      return;
    }

    if (bidAmount <= currentPrice) {
      showToast(`📈 Bid must be higher than current price of ₹${currentPrice.toFixed(2)}`, 'error');
      return;
    }

    // Additional validation for reasonable bid amounts
    if (bidAmount > currentPrice * 10) {
      const confirm = window.confirm(`Are you sure you want to bid ₹${bidAmount.toFixed(2)}? This is significantly higher than the current price.`);
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      
      const bidRequest = {
        amount: bidAmount,
        auctionId: parseInt(auctionId)
        // Note: Don't send userId - backend should extract from token for security
      };

      console.log('Placing bid:', bidRequest);

      const response = await axios.post('http://localhost:8080/api/v1/bids', bidRequest, {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Bid response:', response.data);

      showToast('✅ Bid placed successfully! Redirecting to live view...', 'success');
      
      // Optimistic update for better UX
      setAuction(prev => ({ ...prev, currentPrice: bidAmount }));
      setAmount((bidAmount + 1).toString()); // Suggest next bid amount
      
      setTimeout(() => {
        navigate(`/live/${auctionId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error placing bid:', error);
      
      let errorMessage = '❌ Failed to place bid. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = '🔒 Authentication expired. Please log in again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = '🚫 You are not authorized to place bids.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || '❌ Invalid bid amount or auction ended.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (auction?.id) {
      navigate(`/live/${auction.id}`);
    } else {
      navigate('/auctions');
    }
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only valid decimal numbers
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">⏳ Loading Auction Details...</p>
          <p className="text-gray-400 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 sm:p-6">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
      
      <div className="bg-gray-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            💰 Place Your Bid
          </h2>
          <button
            onClick={handleGoBack}
            className="text-gray-400 hover:text-white transition-colors text-sm hover:bg-gray-700/50 px-3 py-1 rounded-md"
          >
            ← Back
          </button>
        </div>

        {auction ? (
          <>
            <div className="mb-6 p-4 bg-black/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
              {auction.imageUrl && (
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="w-full h-48 sm:h-64 object-contain rounded-md mb-4 bg-gray-800/50"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x200/1a1a1a/ffffff?text=${encodeURIComponent(auction.title.substring(0,15) || 'Auction Item')}`;
                  }}
                />
              )}
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2" title={auction.title}>
                {auction.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {auction.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Starting Price</p>
                  <p className="text-lg font-semibold text-gray-200">₹{auction.startPrice?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-400">Current Bid</p>
                  <p className="text-xl font-bold text-blue-300">
                    ₹{(auction.currentPrice || auction.startPrice)?.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  auction.active 
                    ? 'text-green-400 bg-green-400/20 border border-green-400/30' 
                    : 'text-red-400 bg-red-400/20 border border-red-400/30'
                }`}>
                  {auction.active ? '🟢 Active' : '🔴 Ended'}
                </p>
                {auction.active && (
                  <p className="text-xs text-gray-400">
                    Min bid: ₹{(parseFloat(auction.currentPrice || auction.startPrice) + 0.01).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {auction.active ? (
              <form onSubmit={handleBid} className="space-y-6">
                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    💸 Your Bid Amount (₹)
                  </label>
                  <div className="relative">
                    <input
                      id="bidAmount"
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter your bid amount"
                      className="w-full px-4 py-4 text-white bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg disabled:opacity-60 placeholder-gray-500 backdrop-blur-sm"
                      value={amount}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Must be higher than ₹{(parseFloat(auction.currentPrice || auction.startPrice)).toFixed(2)}
                  </p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting || !auction.active || !amount || parseFloat(amount) <= parseFloat(auction.currentPrice || auction.startPrice)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg transition-all font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Bid...
                    </>
                  ) : '🚀 Place Bid'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">🚫</div>
                <p className="text-red-400 mb-4 text-lg">This auction has ended</p>
                <p className="text-gray-400 mb-6">No more bids can be placed on this auction.</p>
                <button
                  onClick={handleGoBack}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  ← View Auction Details
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg">Failed to load auction</p>
            <p className="text-gray-400 mb-6">The auction details could not be retrieved.</p>
            <button
              onClick={() => navigate('/auctions')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              ← Browse All Auctions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceBid;