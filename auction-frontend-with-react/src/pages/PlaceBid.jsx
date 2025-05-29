import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

function PlaceBid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, apiClient } = useAuth();
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/auction/${id}`);
        
        if (response.data) {
          setAuction(response.data);
          // Set minimum bid amount (current price + 1)
          const minBid = (response.data.currentPrice || response.data.startPrice) + 1;
          setAmount(minBid.toString());
        } else {
          setToast({ type: 'error', message: 'Auction not found' });
        }
      } catch (error) {
        console.error('Error fetching auction:', error);
        setToast({ 
          type: 'error', 
          message: 'Failed to load auction details. Please try again.' 
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuction();
    }
  }, [id, apiClient]);

  const handleBid = async (e) => {
    e.preventDefault();
    
    if (!auction) return;
    
    const bidAmount = parseFloat(amount);
    const currentPrice = auction.currentPrice || auction.startPrice;
    
    // Validation
    if (bidAmount <= currentPrice) {
      setToast({ 
        type: 'error', 
        message: `Bid must be higher than current price of ₹${currentPrice}` 
      });
      return;
    }

    if (!user?.id) {
      setToast({ type: 'error', message: 'User information not available' });
      return;
    }

    try {
      setSubmitting(true);
      const bidRequest = {
        amount: bidAmount,
        userId: user.id,
        auctionId: parseInt(id)
      };

      await apiClient.post('/bids', bidRequest);

      setToast({ type: 'success', message: '✅ Bid placed successfully!' });
      
      // Update local auction state
      setAuction(prev => ({ ...prev, currentPrice: bidAmount }));
      
      // Reset form and set new minimum
      setAmount((bidAmount + 1).toString());
      
      // Navigate back after successful bid
      setTimeout(() => {
        navigate('/live');
      }, 2000);
      
    } catch (error) {
      console.error('Error placing bid:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to place bid. Please try again.';
      
      setToast({ type: 'error', message: `❌ ${errorMessage}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/live');
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
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full">
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
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div className="space-y-3 mb-6">
              <p><strong>Title:</strong> {auction.title}</p>
              <p><strong>Description:</strong> {auction.description}</p>
              <p><strong>Starting Price:</strong> ₹{auction.startPrice}</p>
              <p className="text-green-400">
                <strong>Current Price:</strong> ₹{auction.currentPrice || auction.startPrice}
              </p>
              {auction.endTime && (
                <p><strong>Auction Ends:</strong> {new Date(auction.endTime).toLocaleString()}</p>
              )}
              <p className={`${auction.active ? 'text-green-400' : 'text-red-400'}`}>
                <strong>Status:</strong> {auction.active ? 'Active' : 'Inactive'}
              </p>
            </div>

            {auction.active ? (
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-medium mb-2">
                    Your Bid Amount (minimum: ₹{(auction.currentPrice || auction.startPrice) + 1})
                  </label>
                  <input
                    id="bidAmount"
                    type="number"
                    step="1"
                    min={(auction.currentPrice || auction.startPrice) + 1}
                    placeholder="Enter bid amount"
                    className="w-full px-4 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-md transition-colors"
                >
                  {submitting ? 'Placing Bid...' : 'Submit Bid'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-red-400 mb-4">This auction is no longer active</p>
                <button
                  onClick={handleGoBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Back to Auctions
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-red-400 mb-4">Auction not found or failed to load</p>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Back to Auctions
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default PlaceBid;