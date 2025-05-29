import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, auctionRes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/admin/users', {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
          axios.get('http://localhost:8080/api/v1/auction', {
            headers: { Authorization: `Bearer ${user?.token}` }
          })
        ]);
        
        setUsers(userRes.data);
        setAuctions(auctionRes.data);
      } catch (err) {
        const errorMessage = err.response?.status === 401 
          ? 'Admin access required' 
          : 'Failed to load admin data. Please try again.';
        showToast(errorMessage, 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user?.token, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalAuctions: auctions.length,
    sellers: users.filter(u => u.role === 'SELLER').length,
    bidders: users.filter(u => u.role === 'BIDDER').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🛡️ Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Auctions</p>
                <p className="text-3xl font-bold text-white">{stats.totalAuctions}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Sellers</p>
                <p className="text-3xl font-bold text-white">{stats.sellers}</p>
              </div>
              <div className="text-4xl">🏪</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Bidders</p>
                <p className="text-3xl font-bold text-white">{stats.bidders}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            👥 Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'auctions'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            📦 Auctions ({stats.totalAuctions})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Registered Users</h2>
            {users.length === 0 ? (
              <p className="text-center text-gray-400">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 font-semibold text-gray-300">Email</th>
                      <th className="py-3 px-4 font-semibold text-gray-300">Username</th>
                      <th className="py-3 px-4 font-semibold text-gray-300">Role</th>
                      <th className="py-3 px-4 font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-700 transition-colors">
                        <td className="py-4 px-4 text-gray-200">{u.email}</td>
                        <td className="py-4 px-4 text-gray-200">{u.username}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === 'ADMIN' ? 'bg-red-600 text-white' :
                            u.role === 'SELLER' ? 'bg-purple-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-green-400">All Auctions</h2>
            {auctions.length === 0 ? (
              <p className="text-center text-gray-400">No auctions found.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                  <div key={auction.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={auction.imageUrl || 'https://via.placeholder.com/400x200?text=Auction+Item'} 
                        className="h-40 w-full object-cover" 
                        alt={auction.title} 
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        LIVE
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white">{auction.title}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{auction.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Current Price</p>
                        <p className="text-lg font-bold text-green-400">₹{auction.currentPrice || auction.startPrice}</p>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;