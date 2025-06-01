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

  const handleSocketUpdate = useCallback((update) => {
    setBids(prev => [update, ...prev]);
    setAuctionDetails(prev => ({
      ...prev,
      currentPrice: update.amount,
    }));
    setBidAmount((update.amount + 1).toString());
  }, []);

  const { sendBid, isConnected } = useAuctionSocket(
    auctionId,
    handleSocketUpdate,
    user?.token
  );

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      if (!user?.token) {
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/auction/${auctionId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setAuctionDetails(res.data);
        setBidAmount((res.data.currentPrice + 1).toString());
      } catch (err) {
        showToast("Error loading auction", "error");
      } finally {
        setLoadingDetails(false);
      }
    };

    const fetchBids = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/bids/auction/${auctionId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setBids(res.data);
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchAuctionDetails();
    fetchBids();
  }, [auctionId, user, navigate, showToast]);

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!auctionDetails.active) {
      showToast("Auction is not live.", "error");
      return;
    }
    const numericAmount = Number(bidAmount);
    if (isNaN(numericAmount) || numericAmount <= auctionDetails.currentPrice) {
      showToast(`Bid must be more than ₹${auctionDetails.currentPrice}`, "error");
      return;
    }
    sendBid(numericAmount);
  };

  if (loadingDetails) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <h1 className="text-3xl mb-4 text-green-400">{auctionDetails.title}</h1>
      <img src={auctionDetails.imageUrl} alt={auctionDetails.title} className="w-full max-w-md" />

      <p className="mt-4">Description: {auctionDetails.description}</p>
      <p>Starting Price: ₹{auctionDetails.startPrice}</p>
      <p className="font-bold text-lg text-green-400">Current Price: ₹{auctionDetails.currentPrice}</p>
      <p>Status: {auctionDetails.active ? "Live" : "Ended"}</p>

      {auctionDetails.active && (
        <form onSubmit={handlePlaceBid} className="mt-4">
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            className="p-2 text-black mr-2"
            required
          />
          <button type="submit" className="bg-green-600 px-4 py-2">Place Bid</button>
        </form>
      )}

      <div className="mt-6">
        <h2 className="text-xl mb-2">Bid History:</h2>
        <ul>
          {bids.map((bid, idx) => (
            <li key={idx} className="border-b py-2">
              {bid.bidderUsername || bid.bidder}: ₹{bid.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LiveAuctionPage;
