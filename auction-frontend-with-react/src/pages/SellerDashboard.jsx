// src/pages/SellerDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function SellerDashboard() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchMyAuctions = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8080/api/v1/auctions/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuctions(res.data);
      } catch (err) {
        console.error(err);
        alert("❌ Couldn't fetch seller auctions");
      }
    };
    fetchMyAuctions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-400">📦 My Auctions</h1>
      {auctions.length === 0 ? (
        <p className="text-center text-gray-400">You haven't posted any auctions yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((a) => (
            <div key={a.id} className="bg-gray-900 p-4 rounded shadow">
              <img src={a.imageUrl || 'https://via.placeholder.com/400'} className="h-48 w-full object-cover mb-3 rounded" alt={a.title} />
              <h3 className="text-xl font-semibold">{a.title}</h3>
              <p className="text-gray-300">{a.description}</p>
              <p className="text-green-400 mt-2">Current: ₹{a.currentPrice || a.startPrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
