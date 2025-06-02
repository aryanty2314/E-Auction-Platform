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
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, name: '' });
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) {
        showToast('🔒 Admin access required. Please log in.', 'error');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [userRes, auctionRes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/admin/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get('http://localhost:8080/api/v1/auction/all', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        
        // Initialize auctions with an empty winnerName field
        setUsers(userRes.data);
        setAuctions(auctionRes.data?.map(auction => ({ ...auction, winnerName: null })) || []); //
      } catch (err) {
        const errorMessage = err.response?.status === 401 || err.response?.status === 403
          ? '🚫 Admin access required or session expired.' 
          : '⚠️ Failed to load admin data. Please try again.';
        showToast(errorMessage, 'error');
        console.error("Error fetching admin data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.token, showToast]);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(users.filter(u => u.id !== userId));
      showToast('✅ User deleted successfully!', 'success');
      setDeleteConfirm({ type: null, id: null, name: '' });
    } catch (err) {
      showToast('❌ Failed to delete user.', 'error');
      console.error("Error deleting user:", err);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/delete/${auctionId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAuctions(auctions.filter(a => a.id !== auctionId));
      showToast('✅ Auction deleted successfully!', 'success');
      setDeleteConfirm({ type: null, id: null, name: '' });
    } catch (err) {
      showToast('❌ Failed to delete auction.', 'error');
      console.error("Error deleting auction:", err);
    }
  };

  const handleRevealWinner = async (auctionId) => { // Renamed for clarity
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/auction/winner/${auctionId}`, { //
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Assuming response.data is the winner's name string or a message like "No winner"
      const winnerInfo = response.data;
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === auctionId ? { ...auction, winnerName: winnerInfo } : auction
        )
      );
      if (winnerInfo && !winnerInfo.toLowerCase().includes("no winner") && !winnerInfo.toLowerCase().includes("not found")) {
        showToast(`🏆 Winner for auction #${auctionId}: ${winnerInfo}`, 'success');
      } else {
        showToast(`ℹ️ Auction #${auctionId}: ${winnerInfo}`, 'info');
      }
    } catch (err) {
      const message = err.response?.data || '⚠️ Failed to get winner information.';
      showToast(message, 'error');
      // Optionally set a message like "Error fetching winner"
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === auctionId ? { ...auction, winnerName: "Error fetching info" } : auction
        )
      );
      console.error("Error getting winner:", err);
    }
  };
  
  const openDeleteModal = (type, id, name) => {
    setDeleteConfirm({ type, id, name });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg">⏳ Loading Admin Powers...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalAuctions: auctions.length,
    sellers: users.filter(u => u.role === 'SELLER').length,
    bidders: users.filter(u => u.role === 'BIDDER').length,
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2">👑 Admin Dashboard</h1>
          <p className="text-gray-700">Oversee users and auctions with precision.</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: '👥 Total Users', value: stats.totalUsers, emoji: '👥' },
            { title: '🏛️ Total Auctions', value: stats.totalAuctions, emoji: '🏛️' },
            { title: '💼 Sellers', value: stats.sellers, emoji: '💼' },
            { title: '🙋 Bidders', value: stats.bidders, emoji: '🙋' },
          ].map(stat => (
            <div key={stat.title} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
                <div className="text-3xl text-blue-500">{stat.emoji}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-1 mb-10 bg-gray-100 p-1 rounded-lg border border-gray-200 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ease-in-out ${
              activeTab === 'users'
                ? 'bg-black text-white shadow-md'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            Users ({stats.totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ease-in-out ${
              activeTab === 'auctions'
                ? 'bg-black text-white shadow-md'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            Auctions ({stats.totalAuctions})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">👤 Registered Users</h2>
            </div>
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">🤷 No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      {['ID', 'Email', 'Username', 'Role', 'Actions'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id || u.email} className="hover:bg-gray-100 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            u.role === 'SELLER' ? 'bg-gray-100 text-black border-gray-300' :
                            'bg-gray-100 text-black border-gray-300'
                          }`}>
                            {u.role === 'ADMIN' ? '👑' : u.role === 'SELLER' ? '💼' : '🙋'} {u.role || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => openDeleteModal('user', u.id, u.username)}
                              className="text-red-600 hover:text-red-800 transition-colors font-semibold flex items-center"
                            >
                              🗑️ Delete
                            </button>
                          )}
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">🏛️ All Auctions</h2>
            </div>
            {!auctions || auctions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">🤷 No auctions found.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {auctions.map((auction) => (
                  <div key={auction.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="relative h-48 bg-gray-200">
                      <img 
                        src={auction.imageUrl || `https://via.placeholder.com/400x200/000000/FFFFFF?text=${encodeURIComponent(auction.title.substring(0,15))}`} 
                        className="h-full w-full object-cover" 
                        alt={auction.title} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200/000000/FFFFFF?text=🖼️'; }}
                      />
                       <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold border ${
                          auction.active 
                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                            : 'bg-gray-200 text-black border-gray-400'
                        }`}>
                          {auction.active ? '🟢 LIVE' : '⚪ ENDED'}
                        </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-black mb-1 truncate" title={auction.title}>
                        {auction.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2 flex-grow" title={auction.description}>
                        {auction.description || "No description available."}
                      </p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-left">
                          <p className="text-xs text-gray-600">Start Price</p>
                          <p className="font-semibold text-sm text-black">
                            ₹{auction.startPrice}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600">Current Bid</p>
                          <p className="font-bold text-lg text-blue-700">
                            ₹{auction.currentPrice || auction.startPrice}
                          </p>
                        </div>
                      </div>
                      
                      {/* Winner Display Logic */}
                      {!auction.active && (
                        <div className="mt-2 mb-3 text-sm">
                          {auction.winnerName ? (
                            <p className="font-semibold text-black">
                              🏆 Winner: <span className="text-blue-700">{auction.winnerName}</span>
                            </p>
                          ) : (
                            <button
                              onClick={() => handleRevealWinner(auction.id)}
                              className="w-full bg-gray-100 hover:bg-gray-200 text-black px-3 py-2 rounded text-xs font-medium transition-colors border border-gray-300"
                            >
                              🏆 Reveal Winner
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                        {/* Removed Get Winner button from here, integrated above */}
                        <button
                          onClick={() => openDeleteModal('auction', auction.id, auction.title)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors border border-red-600"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.type && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto border border-gray-300">
              <h3 className="text-xl font-semibold text-black mb-2">
                🗑️ Confirm Deletion
              </h3>
              <p className="text-gray-700 mb-1">
                Are you sure you want to delete this {deleteConfirm.type}:
              </p>
              <p className="text-blue-600 font-semibold mb-6 truncate" title={deleteConfirm.name}>
                 "{deleteConfirm.name}"?
              </p>
              <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ type: null, id: null, name: '' })}
                  className="flex-1 px-4 py-2.5 text-black bg-gray-200 hover:bg-gray-300 rounded-md transition-colors border border-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'user') {
                      handleDeleteUser(deleteConfirm.id);
                    } else {
                      handleDeleteAuction(deleteConfirm.id);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors font-medium"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;