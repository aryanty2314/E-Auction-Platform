// src/pages/SellerDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useToast as useAppToast } from '../hooks/useToast'; // Renamed to avoid conflict with Toast component

function SellerDashboard() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  // const [toast, setToast] = useState(null); // Replaced by useAppToast
  const { toasts, showToast, removeToast } = useAppToast();


  useEffect(() => {
    const fetchAuctionsBySeller = async () => {
      if (!user?.token) {
        // showToast('Authentication required to view your auctions.', 'error');
        return;
      }
      try {
        // Assuming an endpoint to get auctions by the logged-in seller
        // The original '/auction/all' might show all auctions, not just seller's
        // For now, we'll filter client-side if backend doesn't support /auction/my-auctions
        // Or, if this dashboard is for admins too, '/auction/all' might be intended.
        // Let's assume for a seller, they should see auctions they created.
        // This requires auction objects to have a sellerId or similar.
        // The current Auction object from CreateAuction doesn't explicitly send sellerId (backend infers from token).
        // So, if '/auction/all' is the only option, we'll use it.
        const res = await axios.get(
          'http://localhost:8080/api/v1/auction/all', // Or a more specific endpoint like /api/v1/auction/seller
          { headers: { Authorization: `Bearer ${user.token}` } } // user.token is okay here because we check user?.token above
        );
        // If the endpoint returns all auctions, you might need to filter them by seller.
        // This assumes the auction object has a `sellerUsername` or `sellerId` field.
        // For simplicity, if user.username exists and auction has a seller identifier:
        // const sellerAuctions = res.data.filter(auction => auction.sellerUsername === user.username);
        // setAuctions(sellerAuctions);
        setAuctions(res.data); // Assuming for now it returns relevant auctions or all for admin/seller view
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || 'Could not load auctions';
        showToast(errorMessage, 'error');
      }
    };

    fetchAuctionsBySeller();
  }, [user?.token, showToast]); // Added showToast to dependencies

  const handleActivate = async (id) => {
    if (!user?.token) {
      showToast('Authentication required.', 'error');
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/api/v1/auction/activate/${id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } } // user.token is okay here
      );
      showToast(`Auction #${id} activated!`, 'success');
      // fetchAuctionsBySeller(); // Re-fetch or update state locally
      setAuctions(prevAuctions => prevAuctions.map(auc => 
        auc.id === id ? { ...auc, active: true } : auc
      ));
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || `Activation failed for #${id}`;
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      {toasts.map(t => ( // Display toasts from useAppToast
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
      <h1 className="text-3xl font-bold mb-4 text-center text-green-400">🧑‍💼 My Auctions</h1>
      {auctions.length === 0 && <p className="text-center text-gray-400">You have not created any auctions yet, or they are still loading.</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map(a => (
          <div key={a.id} className="bg-gray-900 p-4 rounded shadow relative">
            <img
              src={a.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
              className="h-48 w-full object-cover mb-3 rounded"
              alt={a.title}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
            />
            <h3 className="text-xl font-semibold">{a.title}</h3>
            <p className="text-gray-300 line-clamp-2">{a.description}</p>
            <p className="text-green-400 mt-2">
              Starting: ₹{a.startPrice} | Current: ₹{a.currentPrice || a.startPrice}
            </p>
            { !a.active && (
              <button
                onClick={() => handleActivate(a.id)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
              >Activate</button>
            )}
            { a.active && (
              <span className="absolute top-2 right-2 bg-green-600 px-2 py-1 text-xs rounded">LIVE</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerDashboard;