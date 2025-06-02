import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function LiveAuctionPage() {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [auctionDetails, setAuctionDetails] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSocketUpdate = useCallback((update) => {
    setBids(prev => [update, ...prev.filter(b => b.id !== update.id)]); // Avoid duplicates if update has ID
    setAuctionDetails(prev => ({
      ...prev,
      currentPrice: update.amount,
    }));
    // Suggest next bid slightly higher
    setBidAmount( (parseFloat(update.amount) + 1).toString() ); 
  }, []);

  const { sendBid, isConnected } = useAuctionSocket(
    auctionId,
    handleSocketUpdate,
    user?.token
  );

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!user?.token) {
        showToast('🔒 Please log in to view the auction.', 'error');
        navigate('/login', { replace: true });
        return;
      }
      setLoadingDetails(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAuctionDetails(res.data);
        // Set initial bid amount suggestion
        const initialNextBid = (parseFloat(res.data.currentPrice || res.data.startPrice) + 1);
        setBidAmount(initialNextBid > 0 ? initialNextBid.toString() : "1");
      } catch (err) {
        showToast("⚠️ Error loading auction details.", "error");
        console.error("Error fetching auction details:", err);
        navigate('/auctions', { replace: true }); // Redirect if auction can't be loaded
      } finally {
        setLoadingDetails(false);
      }
    };
    const handleActivate = async (id) => {
  if (!user?.token) {
    showToast('🔒 Authentication required.', 'error');
    return;
  }
  try {
    const response = await axios.post(
      `http://localhost:8080/api/v1/auction/activate/${id}`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    
    // Update the auction in state with the response data
    setAuctions(prevAuctions => prevAuctions.map(auc => 
      auc.id === id ? { ...response.data, winnerName: null } : auc
    ));
    
    showToast(`✅ Auction activated! It's now LIVE!`, 'success');
  } catch (err) {
    const errorMessage = err.response?.data?.message || `⚠️ Activation failed.`;
    showToast(errorMessage, 'error');
    console.error("Activation error:", err);
  }
};

    const fetchBids = async () => {
       if (!user?.token) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/bids/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBids(res.data || []);
      } catch (err) {
        console.error("Error fetching bids:", err);
        // Don't necessarily show toast for bid history fetch failure unless critical
      }
    };

    fetchAuctionDetails();
    fetchBids();
  }, [auctionId, user?.token, navigate, showToast]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!auctionDetails?.active) {
      showToast("🚫 Auction is not currently active.", "error");
      return;
    }
    if (!isConnected) {
      showToast("🔌 Not connected to auction server. Please wait or refresh.", "error");
      return;
    }
    setIsSubmitting(true);
    const numericAmount = Number(bidAmount);
    if (isNaN(numericAmount) || numericAmount <= (auctionDetails.currentPrice || auctionDetails.startPrice) ) {
      showToast(`💸 Bid must be higher than current ₹${auctionDetails.currentPrice || auctionDetails.startPrice}`, "error");
      setIsSubmitting(false);
      return;
    }

    try {
        // The WebSocket 'sendBid' will handle the actual bid placement via WebSocket.
        // If you also need to POST to an HTTP endpoint for bids (redundant if socket works), do it here.
        // For now, assuming WebSocket is the primary channel for live bidding.
        sendBid(numericAmount); 
        // Optimistic UI update can happen via handleSocketUpdate, or partially here:
        // setBidAmount((numericAmount + 1).toString()); // Suggest next bid
        showToast("✅ Bid sent!", "success", 1500); // Short success
    } catch (error) {
        console.error("Error placing bid:", error);
        showToast("❌ Failed to send bid.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and at most two decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setBidAmount(value);
    }
  };


  if (loadingDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">⏳ Loading Auction Room...</p>
        </div>
      </div>
    );
  }

  if (!auctionDetails) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-3xl mb-4">Auction Not Found</h1>
        <p className="text-gray-400 mb-8">This auction might have ended or never existed.</p>
        <button onClick={() => navigate('/auctions')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          ⬅️ Back to Auctions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-10 pb-20 px-4">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="w-full max-w-4xl bg-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Image & Details */}
          <div className="md:w-1/2">
            <img 
              src={auctionDetails.imageUrl || `https://via.placeholder.com/600x400/000000/FFFFFF?text=${encodeURIComponent(auctionDetails.title.substring(0,20))}`} 
              alt={auctionDetails.title} 
              className="w-full h-auto max-h-96 object-contain rounded-lg mb-6 border border-gray-700"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400/000000/FFFFFF?text=🖼️'; }}
            />
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 truncate" title={auctionDetails.title}>{auctionDetails.title}</h1>
            <p className="text-gray-300 mb-4 text-sm">{auctionDetails.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-400">Seller:</p>
                <p className="font-medium">{auctionDetails.createdByUsername || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Starting Price:</p>
                <p className="font-medium">₹{auctionDetails.startPrice}</p>
              </div>
               <div className="col-span-2">
                <p className="text-gray-400">Status:</p>
                <p className={`font-bold text-lg ${auctionDetails.active ? 'text-blue-400' : 'text-red-400'}`}>
                  {auctionDetails.active ? '🟢 LIVE' : '⚪ ENDED'} {!isConnected && auctionDetails.active && <span className="text-xs text-red-400">(Connecting...)</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding & History */}
          <div className="md:w-1/2 flex flex-col">
            <div className="bg-black p-6 rounded-lg border border-gray-700 mb-6">
              <p className="text-gray-300 text-sm">Current Highest Bid:</p>
              <p className="font-bold text-4xl text-blue-400 mb-4">₹{auctionDetails.currentPrice || auctionDetails.startPrice}</p>

              {auctionDetails.active && (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="sr-only">Bid Amount</label>
                    <input
                      id="bidAmount"
                      type="text" // Use text to control input format via regex
                      inputMode="decimal" // Suggests numeric keyboard on mobile
                      value={bidAmount}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-lg disabled:opacity-50"
                      placeholder={`Min. ₹${(parseFloat(auctionDetails.currentPrice || auctionDetails.startPrice) + 1)}`}
                      required
                      disabled={!isConnected || isSubmitting}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!isConnected || isSubmitting || !auctionDetails.active}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Placing...
                      </>
                    ) : '💸 Place Bid'}
                  </button>
                </form>
              )}
              {!auctionDetails.active && (
                <p className="text-center text-gray-400 py-4">Bidding has ended for this item.</p>
              )}
            </div>

            <div className="flex-grow bg-black p-6 rounded-lg border border-gray-700 overflow-hidden">
              <h2 className="text-xl font-semibold mb-3 text-center">📜 Bid History</h2>
              {bids.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                  {bids.map((bid, idx) => (
                    <li 
                      key={bid.id || idx} 
                      className={`p-2.5 rounded-md text-sm flex justify-between items-center ${idx === 0 ? 'bg-blue-900/50 border border-blue-700' : 'bg-gray-800 border border-gray-700'}`}
                    >
                      <span className="font-medium truncate">👤 {bid.bidderUsername || bid.bidder || 'Anonymous'}</span>
                      <span className="font-semibold text-blue-300">₹{bid.amount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No bids yet. Be the first! ✨</p>
              )}
            </div>
            
          </div>
        </div>
        <button onClick={() => navigate('/auctions')} className="mt-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors block mx-auto">
            ⬅️ Back to All Auctions
        </button>
      </div>
    </div>
  );
}

export default LiveAuctionPage;