// src/pages/SellerDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function SellerDashboard() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await axios.get(
        'http://localhost:8080/api/v1/auction/all',
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAuctions(res.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: `Could not load auctions` });
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/v1/auction/activate/${id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setToast({ type: 'success', message: `Auction #${id} activated!` });
      fetchAuctions(); // refresh list
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: `Activation failed for #${id}` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-green-400">🧑‍💼 My Auctions</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map(a => (
          <div key={a.id} className="bg-gray-900 p-4 rounded shadow relative">
            <img
              src={a.imageUrl || 'https://via.placeholder.com/400'}
              className="h-48 w-full object-cover mb-3 rounded"
              alt={a.title}
            />
            <h3 className="text-xl font-semibold">{a.title}</h3>
            <p className="text-gray-300">{a.description}</p>
            <p className="text-green-400 mt-2">
              Current: ₹{a.currentPrice || a.startPrice}
            </p>
            { !a.active && (
              <button
                onClick={() => handleActivate(a.id)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
              >Activate</button>
            )}
            { a.active && (
              <span className="absolute top-2 right-2 bg-green-600 px-2 py-1 text-xs rounded">LIVE</span>
            )}
          </div>
        ))}
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

export default SellerDashboard;
