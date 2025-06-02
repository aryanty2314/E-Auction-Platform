import { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useToast as useAppToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

function SellerDashboard() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const { toasts, showToast, removeToast } = useAppToast();
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, title: '' });
  const [editAuction, setEditAuction] = useState(null);
  const navigate = useNavigate();

  const fetchAuctionsBySeller = async () => {
    if (!user?.token) {
      showToast('🔒 Authentication required.', 'error');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/auction/user/${user.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAuctions(res.data.map(auction => ({
        ...auction,
        winnerName: null,
        currentPrice: auction.currentPrice || auction.startPrice
      })));
    } catch (err) {
      console.error("Error fetching seller's auctions:", err);
      const errorMessage = err.response?.data?.message || '⚠️ Could not load your auctions.';
      if (err.response?.status === 403) {
        showToast("🚫 You are not authorized to view this page.", 'error');
        navigate('/');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionsBySeller();
  }, [user?.token]);

  const handleActivate = async (id) => {
  if (!user?.token) {
    showToast('🔒 Authentication required.', 'error');
    return;
  }
  try {
    const response = await axios.post(
      `http://localhost:8080/api/v1/auction/activate/${id}`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    
    // Update the auction in state with the response data
    setAuctions(prevAuctions => prevAuctions.map(auc => 
      auc.id === id ? { ...response.data, winnerName: null } : auc
    ));
    
    showToast(`✅ Auction activated! It's now LIVE!`, 'success');
  } catch (err) {
    const errorMessage = err.response?.data?.message || `⚠️ Activation failed.`;
    showToast(errorMessage, 'error');
    console.error("Activation error:", err);
  }
};

  const handleDeleteAuction = async (auctionId) => {
    if (!user?.token) {
      showToast('🔒 Authentication required.', 'error');
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/v1/auction/${auctionId}`, { 
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAuctions(auctions.filter(a => a.id !== auctionId));
      showToast('🗑️ Auction deleted successfully!', 'success');
      setDeleteConfirm({ id: null, title: '' });
    } catch (err) {
      const errorMessage = err.response?.data?.message || '❌ Failed to delete auction.';
      showToast(errorMessage, 'error');
      console.error("Error deleting auction:", err);
    }
  };

  const handleUpdateAuction = async (updatedData) => {
    if (!user?.token) {
      showToast('🔒 Authentication required.', 'error');
      return false;
    }
    try {
      const res = await axios.put(
        `http://localhost:8080/api/v1/auction/${editAuction.id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAuctions(prevAuctions => 
        prevAuctions.map(auc => 
          auc.id === editAuction.id ? { ...auc, ...res.data } : auc
        )
      );
      showToast('✅ Auction updated successfully!', 'success');
      setEditAuction(null);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '⚠️ Failed to update auction.';
      showToast(errorMessage, 'error');
      console.error("Error updating auction:", err);
      return false;
    }
  };

  const handleRevealWinner = async (auctionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/auction/winner/${auctionId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
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
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === auctionId ? { ...auction, winnerName: "Error fetching info" } : auction
        )
      );
      console.error("Error getting winner:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">⏳ Loading Your Auction Space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}

      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">💼 My Auction Listings</h1>
        <p className="text-gray-400 mt-2">Manage, activate, and track your auctions.</p>
        <button 
          onClick={() => navigate('/create-auction')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-md inline-flex items-center"
        >
          ✨ Create New Auction
        </button>
      </header>

      {auctions.length === 0 && !loading && (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">🏜️</div>
          <p className="text-xl text-gray-300 mb-2">No auctions listed yet.</p>
          <p className="text-gray-500">Ready to sell? Click the button above to create your first auction!</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {auctions.map(a => (
          <div key={a.id} className="bg-gray-900 p-5 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col group">
            <div className="relative h-48 sm:h-52 w-full object-cover mb-4 rounded-lg overflow-hidden">
              <img
                src={a.imageUrl || `https://via.placeholder.com/400x200/000000/FFFFFF?text=${encodeURIComponent(a.title.substring(0,15))}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt={a.title}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200/000000/FFFFFF?text=🖼️'; }}
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold border ${
                  a.active 
                  ? 'bg-blue-500 text-white border-blue-400' 
                  : 'bg-gray-700 text-gray-300 border-gray-600'
              }`}>
                  {a.active ? '🟢 LIVE' : '⚪ ENDED'}
              </div>
            </div>
            
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-semibold text-white mb-1 truncate" title={a.title}>{a.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-2 mb-3 flex-grow">{a.description || "No description provided."}</p>
              
              <div className="flex justify-between items-center text-sm mb-2">
                <div>
                  <p className="text-xs text-gray-400">Starts At</p>
                  <p className="font-semibold text-gray-200">₹{a.startPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-400">Current Bid</p>
                  <p className="font-bold text-lg text-blue-300">₹{a.currentPrice || a.startPrice}</p>
                </div>
              </div>

              {!a.active && (
                <div className="my-2 text-sm">
                  {a.winnerName ? (
                    <p className="font-semibold text-white">
                      🏆 Winner: <span className="text-blue-400">{a.winnerName}</span>
                    </p>
                  ) : (
                    <button
                      onClick={() => handleRevealWinner(a.id)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-gray-600"
                    >
                      🏆 Reveal Winner
                    </button>
                  )}
                </div>
              )}

              <div className="mt-auto space-y-2">
                {!a.active && !a.winnerName && (
                  <button
                    onClick={() => handleActivate(a.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors font-medium shadow"
                  >
                    🚀 Activate Now
                  </button>
                )}
                {a.active && (
                  <button
                    onClick={() => navigate(`/live/${a.id}`)}
                    className="w-full bg-black hover:bg-gray-800 text-white border border-blue-500 py-2.5 rounded-lg transition-colors font-medium shadow"
                  >
                    👀 View Live Auction
                  </button>
                )}
                <button
                  onClick={() => setEditAuction(a)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  ✏️ Edit Auction
                </button>
                <button
                  onClick={() => setDeleteConfirm({ id: a.id, title: a.title })}
                  className="w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  🗑️ Delete Auction
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.id && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto border border-gray-700 text-white">
            <h3 className="text-xl font-semibold mb-2">
              🗑️ Confirm Deletion
            </h3>
            <p className="text-gray-300 mb-1">
              Are you sure you want to delete the auction:
            </p>
            <p className="text-blue-400 font-semibold mb-6 truncate" title={deleteConfirm.title}>
              "{deleteConfirm.title}"?
            </p>
            <p className="text-sm text-red-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ id: null, title: '' })}
                className="flex-1 px-4 py-2.5 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors border border-gray-500 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAuction(deleteConfirm.id)}
                className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors font-medium"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Auction Modal */}
      {editAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-700 text-white">
            <h3 className="text-xl font-semibold mb-4">✏️ Edit Auction</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedData = {
                title: formData.get('title'),
                description: formData.get('description'),
                startPrice: parseFloat(formData.get('startPrice')),
                imageUrl: formData.get('imageUrl')
              };
              handleUpdateAuction(updatedData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editAuction.title}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editAuction.description}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Price (₹)</label>
                  <input
                    type="number"
                    name="startPrice"
                    defaultValue={editAuction.startPrice}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    defaultValue={editAuction.imageUrl || ''}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditAuction(null)}
                  className="flex-1 px-4 py-2.5 text-white bg-gray-600 hover:bg-gray-500 rounded-md transition-colors border border-gray-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;