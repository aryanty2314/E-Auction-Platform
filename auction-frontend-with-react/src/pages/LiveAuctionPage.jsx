import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast'; // Import useToast
import Toast from '../components/Toast';     // Import Toast component

function LiveAuctionPage() {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast(); // useToast hook

  const [auctionDetails, setAuctionDetails] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);


  const handleSocketUpdate = useCallback((update) => {
    console.log('Received bid update:', update);
    // Assuming the update contains the new bid and potentially the bidder's username
    // And also updates the auction's current price
    setBids(prev => [update, ...prev.filter(b => b.bidder !== update.bidder || b.amount !== update.amount)].sort((a,b) => b.amount - a.amount));
    if (auctionDetails && update.amount > (auctionDetails.currentPrice || auctionDetails.startPrice)) {
      setAuctionDetails(prev => ({ ...prev, currentPrice: update.amount }));
    }
     // Set a default next bid amount
    const nextMinBid = (update.amount || auctionDetails?.currentPrice || auctionDetails?.startPrice || 0) + 1;
    setBidAmount(nextMinBid.toString());

  }, [auctionDetails]);

  const handleSocketError = useCallback((error) => {
    console.error('WebSocket Error:', error);
    showToast('Error connecting to live bid server. Please refresh.', 'error');
    setSocketConnected(false);
  }, [showToast]);
  
  const handleSocketConnect = useCallback(() => {
    console.log('WebSocket Connected');
    showToast('Connected to live bidding!', 'success');
    setSocketConnected(true);
  }, [showToast]);


  const { sendBid, isConnected } = useAuctionSocket(
    auctionId, 
    handleSocketUpdate, 
    user?.token,
    handleSocketError, // Pass error handler
    handleSocketConnect // Pass connect handler
  );

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!user?.token) {
        showToast('Please log in to view auction details.', 'error');
        setLoadingDetails(false);
        return;
      }
      try {
        setLoadingDetails(true);
        const response = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAuctionDetails(response.data);
        // Set initial bid amount based on current/start price
        const minBid = (response.data.currentPrice || response.data.startPrice || 0) + 1;
        setBidAmount(minBid > 0 ? minBid.toString() : "1");

        // Fetch initial bids (optional, if socket doesn't send history)
        // const bidsResponse = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}/bids`, {
        //   headers: { Authorization: `Bearer ${user.token}` }
        // });
        // setBids(bidsResponse.data.sort((a,b) => b.amount - a.amount));

      } catch (error) {
        console.error('Error fetching auction details:', error);
        showToast(error.response?.data?.message || 'Failed to load auction details.', 'error');
        if (error.response?.status === 404) navigate('/auctions'); // Auction not found
      } finally {
        setLoadingDetails(false);
      }
    };

    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId, user?.token, showToast, navigate]);

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!isConnected()) { // Check if socket is connected via isConnected from hook
        showToast('Not connected to bidding server. Please wait or refresh.', 'error');
        return;
    }
    if (!auctionDetails || !auctionDetails.active) {
      showToast('This auction is not active for bidding.', 'error');
      return;
    }
    const numericBidAmount = Number(bidAmount);
    const currentAuctionPrice = auctionDetails.currentPrice || auctionDetails.startPrice;

    if (isNaN(numericBidAmount) || numericBidAmount <= 0) {
      showToast('Please enter a valid bid amount.', 'error');
      return;
    }
    if (numericBidAmount <= currentAuctionPrice) {
      showToast(`Your bid must be higher than ₹${currentAuctionPrice}.`, 'error');
      return;
    }
    // Optimistically update UI or wait for socket confirmation
    sendBid(numericBidAmount); 
    // Bid amount reset/increment will be handled by handleSocketUpdate
  };
  
  const currentPrice = auctionDetails?.currentPrice || auctionDetails?.startPrice;
  const suggestedMinBid = (currentPrice || 0) + 1;

  if (loadingDetails) {
    return (
      <div className="p-6 min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
        <p className="ml-4 text-xl">Loading Auction...</p>
      </div>
    );
  }

  if (!auctionDetails) {
    return (
      <div className="p-6 min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
        <p className="text-xl text-red-400 mb-4">Auction could not be loaded.</p>
        <button onClick={() => navigate('/auctions')} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
          Back to Auctions
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 md:p-8">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}

      <div className="max-w-4xl mx-auto bg-gray-800 shadow-2xl rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {auctionDetails.title}
            </h1>
             <button onClick={() => navigate('/auctions')} className="text-sm text-gray-400 hover:text-green-400">
                ← All Auctions
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <img 
                src={auctionDetails.imageUrl || 'https://via.placeholder.com/600x400?text=Item+Image'} 
                alt={auctionDetails.title} 
                className="w-full h-64 object-cover rounded-lg shadow-md mb-4 border border-gray-700"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+Error'; }}
            />
            <p className="text-gray-300 mb-2"><span className="font-semibold text-gray-100">Description:</span> {auctionDetails.description}</p>
            <p className="text-gray-300"><span className="font-semibold text-gray-100">Starting Price:</span> ₹{auctionDetails.startPrice}</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
                Current Price: ₹{currentPrice}
            </p>
            {!auctionDetails.active && <p className="text-red-500 font-semibold mt-2">Auction Ended</p>}
             <p className={`mt-1 text-sm ${isConnected() ? 'text-green-500' : 'text-red-500'}`}>
                Live Connection: {isConnected() ? 'Active' : 'Disconnected'}
            </p>
          </div>

          <div>
            {auctionDetails.active ? (
                <form onSubmit={handlePlaceBid} className="bg-gray-700 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold text-white mb-4">Place Your Bid</h2>
                <div className="mb-4">
                    <label htmlFor="bidAmountInput" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Bid (Min. ₹{suggestedMinBid})
                    </label>
                    <input
                    id="bidAmountInput"
                    type="number"
                    className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min. ₹${suggestedMinBid}`}
                    min={suggestedMinBid}
                    required
                    disabled={!isConnected()}
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isConnected() || !auctionDetails.active}
                >
                    {isConnected() ? 'Place Bid' : 'Connecting...'}
                </button>
                </form>
            ) : (
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner text-center">
                    <h2 className="text-xl font-semibold text-white mb-4">Bidding Closed</h2>
                    <p className="text-gray-300">This auction is no longer active.</p>
                </div>
            )}

            <div className="mt-6 bg-gray-700 p-4 rounded-lg max-h-80 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-600 pb-2">🏆 Bid History</h3>
                {bids.length === 0 && <p className="text-gray-400 text-sm">No bids yet. Be the first!</p>}
                <ul>
                {bids.map((bid, idx) => (
                    <li key={bid.id || idx} className={`flex justify-between py-2 px-2 rounded ${idx === 0 ? 'bg-green-700 bg-opacity-30' : ''} ${idx > 0 && idx % 2 !== 0 ? 'bg-gray-600 bg-opacity-40': ''}`}>
                    <span className="text-gray-200 font-medium">{bid.bidderUsername || bid.bidder || 'Anonymous Bidder'}</span> 
                    <span className="text-green-300 font-bold">₹{bid.amount}</span>
                    </li>
                ))}
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveAuctionPage;