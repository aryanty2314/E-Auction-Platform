import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast'; // Assuming this is your custom Toast component
import { useToast as useAppToast } from '../hooks/useToast'; // To use your useToast hook

function PlaceBid() {
  const { id: auctionId } = useParams(); // Renamed to auctionId for clarity
  const navigate = useNavigate();
  const { user } = useAuth(); // Removed apiClient, as it's not provided by AuthContext
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState('');
  // const [toast, setToast] = useState(null); // Replaced by useAppToast
  const { toasts, showToast, removeToast } = useAppToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      if (!user?.token) {
        showToast('Please log in to view auction details.', 'error');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (response.data) {
          setAuction(response.data);
          const minBid = (response.data.currentPrice || response.data.startPrice) + 1;
          setAmount(minBid > 0 ? minBid.toString() : "1"); // Ensure minBid is at least 1
        } else {
          showToast('Auction not found', 'error');
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
        showToast(
          error.response?.data?.message || 'Failed to load auction details. Please try again.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId, user?.token, showToast]); // Added showToast to dependencies

  const handleBid = async (e) => {
  e.preventDefault();
  
  if (!auction || !user?.token) {
    showToast('Cannot place bid. Auction or user data missing.', 'error');
    return;
  }
  
  const bidAmount = parseFloat(amount);
  const currentPrice = auction.currentPrice || auction.startPrice;
  
  if (isNaN(bidAmount) || bidAmount <= 0) {
    showToast('Please enter a valid bid amount.', 'error');
    return;
  }

  if (bidAmount <= currentPrice) {
    showToast(`Bid must be higher than current price of ₹${currentPrice}`, 'error');
    return;
  }

  try {
    setSubmitting(true);
    const bidRequest = {
      amount: bidAmount,
      auctionId: parseInt(auctionId),
      userId: user.id // Add this line - make sure user.id is available
    };

    await axios.post('http://localhost:8080/api/v1/bids', bidRequest, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    showToast('✅ Bid placed successfully!', 'success');
    
    setAuction(prev => ({ ...prev, currentPrice: bidAmount }));
    setAmount((bidAmount + 1).toString());
    
    setTimeout(() => {
      navigate(`/live/${auctionId}`);
    }, 1500);
    
  } catch (error) {
    console.error('Error placing bid:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to place bid. Please try again.';
    showToast(`❌ ${errorMessage}`, 'error');
  } finally {
    setSubmitting(false);
  }
};

  const handleGoBack = () => {
    // Navigate to the specific live auction page or a general auctions page
    navigate(auction ? `/live/${auction.id}` : '/auctions');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading auction details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      {toasts.map(t => ( // Display toasts from useAppToast
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💰 Place Your Bid</h2>
          <button
            onClick={handleGoBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {auction ? (
          <>
            {auction.imageUrl && (
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-48 object-cover rounded mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available'; // Fallback image
                }}
              />
            )}
            
            <div className="space-y-3 mb-6">
              <p><strong>Title:</strong> {auction.title}</p>
              <p className="line-clamp-3"><strong>Description:</strong> {auction.description}</p>
              <p><strong>Starting Price:</strong> ₹{auction.startPrice}</p>
              <p className="text-green-400 font-semibold">
                <strong>Current Price:</strong> ₹{auction.currentPrice || auction.startPrice}
              </p>
              {auction.endTime && ( // Assuming endTime might be available
                <p><strong>Auction Ends:</strong> {new Date(auction.endTime).toLocaleString()}</p>
              )}
              <p className={`${auction.active ? 'text-green-400' : 'text-red-400'}`}>
                <strong>Status:</strong> {auction.active ? 'Active' : 'Inactive/Ended'}
              </p>
            </div>

            {auction.active ? (
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-medium mb-2">
                    Your Bid (Minimum: ₹{(auction.currentPrice || auction.startPrice) + 1})
                  </label>
                  <input
                    id="bidAmount"
                    type="number"
                    step="1"
                    min={(auction.currentPrice || auction.startPrice) + 1}
                    placeholder="Enter bid amount"
                    className="w-full px-4 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 border border-gray-400"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting || !auction.active}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-md transition-colors font-semibold"
                >
                  {submitting ? 'Placing Bid...' : 'Submit Bid'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-red-400 mb-4">This auction is no longer active for bidding.</p>
                <button
                  onClick={handleGoBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Back to Auction
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-red-400 mb-4">Auction details could not be loaded.</p>
            <button
              onClick={() => navigate('/auctions')} // General fallback
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Back to Auctions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceBid;