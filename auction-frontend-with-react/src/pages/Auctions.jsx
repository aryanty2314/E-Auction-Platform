// src/pages/Auctions.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function Auctions() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/v1/auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch auctions.');
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Live Auctions</h1>
      {auctions.length === 0 ? (
        <p className="text-center">No active auctions right now.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-lg">
              <img src={auction.imageUrl || 'https://via.placeholder.com/400x200?text=Auction+Item'} alt={auction.title} className="w-full h-48 object-cover rounded-md mb-4" />
              <h2 className="text-xl font-semibold mb-2">{auction.title}</h2>
              <p className="text-gray-300 mb-2">{auction.description}</p>
              <p className="text-green-400 font-semibold">Current Price: ₹{auction.currentPrice || auction.startPrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Auctions;
