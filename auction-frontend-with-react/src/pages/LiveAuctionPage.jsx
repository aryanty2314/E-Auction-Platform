import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { useAuth } from '../context/AuthContext';

function LiveAuctionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [price, setPrice] = useState('');

  const { sendBid } = useAuctionSocket(id, (update) => {
    setBids(prev => [update, ...prev]);
  }, user?.token);

  const handleBid = (e) => {
    e.preventDefault();
    sendBid(Number(price));
    setPrice('');
  };

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold text-green-400 mb-4">Live Auction #{id}</h1>
      <form onSubmit={handleBid} className="flex gap-2 mb-6">
        <input
          type="number"
          className="p-2 text-black rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button className="bg-green-600 px-4 py-2 rounded">Place Bid</button>
      </form>

      <div className="bg-gray-900 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">🏆 Bid Leaderboard</h2>
        {bids.sort((a, b) => b.amount - a.amount).map((bid, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <span>{bid.bidder}</span>
            <span>₹{bid.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveAuctionPage;
