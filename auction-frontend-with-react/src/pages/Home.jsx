import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, hasAnyRole } = useAuth();

  const handleCreateAuction = () => {
    if (isAuthenticated() && hasAnyRole(['SELLER', 'ADMIN'])) {
      navigate('/create-auction');
    } else if (isAuthenticated()) {
      navigate('/auctions');
    } else {
      navigate('/login');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/auctions');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white text-center px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-6 animate-pulse">Welcome to Bidzy</h1>
        <p className="text-2xl mb-12 text-gray-100">Your one-stop platform for online auctions</p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {!isAuthenticated() ? (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted} 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/auctions')} 
              className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
            >
              View Auctions
            </button>
          )}
          
          <button 
            onClick={handleCreateAuction} 
            className="bg-green-500 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
          >
            Create Auction
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-3">🎯 Easy Bidding</h3>
            <p>Place bids on your favorite items with just a few clicks</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-3">🚀 Quick Setup</h3>
            <p>Create and manage your auctions effortlessly</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-3">🔒 Secure Platform</h3>
            <p>Your transactions and data are always protected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;