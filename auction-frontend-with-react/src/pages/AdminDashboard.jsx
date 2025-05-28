// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const userRes = await axios.get('http://localhost:8080/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(userRes.data);

        const auctionRes = await axios.get('http://localhost:8080/api/v1/auctions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuctions(auctionRes.data);
      } catch (err) {
        console.error(err);
        alert("❌ Admin data load failed");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-yellow-400">🛡️ Admin Dashboard</h1>

      <h2 className="text-2xl font-semibold mb-2">👥 Registered Users</h2>
      <table className="w-full text-left mb-10">
        <thead>
          <tr className="border-b border-gray-700">
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800">
              <td>{u.email}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mb-2">📦 All Auctions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((a) => (
          <div key={a.id} className="bg-gray-900 p-4 rounded shadow">
            <img src={a.imageUrl || 'https://via.placeholder.com/400'} className="h-48 w-full object-cover mb-3 rounded" alt={a.title} />
            <h3 className="text-xl font-semibold">{a.title}</h3>
            <p className="text-gray-300">{a.description}</p>
            <p className="text-green-400 mt-2">₹{a.currentPrice || a.startPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
