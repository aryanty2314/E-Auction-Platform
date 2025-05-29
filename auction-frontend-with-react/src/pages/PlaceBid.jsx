import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

function PlaceBid() {
  const { id } = useParams(); // Auction ID from URL
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [amount, setAmount] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/auction/${id}`);
        setAuction(res.data);
      } catch (err) {
        setToast({ type: 'error', message: 'Auction not found or failed to load' });
      }
    };
    fetchAuction();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    try {
      const bidRequest = {
        amount: parseFloat(amount),
        userId: user?.id,
        auctionId: parseInt(id)
      };

      await axios.post(`http://localhost:8080/api/v1/bids`, bidRequest, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setToast({ type: 'success', message: '✅ Bid placed successfully' });
      setAmount('');
    } catch (err) {
      setToast({ type: 'error', message: '❌ Bid failed. Try a higher amount.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">💰 Place Your Bid</h2>

        {auction ? (
          <>
            <p className="mb-2"><strong>Title:</strong> {auction.title}</p>
            <p className="mb-2"><strong>Current Price:</strong> ₹{auction.currentPrice || auction.startPrice}</p>

            <form onSubmit={handleBid} className="mt-4 space-y-3">
              <input
                type="number"
                step="1"
                min={auction.currentPrice || auction.startPrice + 1}
                placeholder="Enter bid amount"
                className="w-full px-4 py-2 text-black rounded-md focus:outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
                Submit Bid
              </button>
            </form>
          </>
        ) : (
          <p>Loading auction details...</p>
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
