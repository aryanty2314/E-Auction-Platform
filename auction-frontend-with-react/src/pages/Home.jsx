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

  const handleGetStartedOrBrowse = () => {
    if (isAuthenticated()) {
      navigate('/auctions');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white text-center px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-7xl mb-6 animate-bounce">🎉</div> 
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          Welcome to <span className="text-blue-400">Bidzy</span>
        </h1>
        <p className="text-xl sm:text-2xl mb-12 text-gray-300">
          Your premier destination for exciting online auctions. Find rare items or sell your treasures!
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 mb-12">
          {!isAuthenticated() ? (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
              >
                🔑 Login
              </button>
              <button 
                onClick={handleGetStartedOrBrowse} 
                className="bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-black shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
              >
                🚀 Get Started
              </button>
            </>
          ) : (
            <button 
              onClick={handleGetStartedOrBrowse} 
              className="bg-blue-500 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
            >
              🏛️ Browse Auctions
            </button>
          )}
          
          {isAuthenticated() && hasAnyRole(['SELLER', 'ADMIN']) && (
            <button 
              onClick={handleCreateAuction} 
              className="bg-white text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-200 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
            >
              ✨ Create Auction
            </button>
          )}
           {isAuthenticated() && !hasAnyRole(['SELLER', 'ADMIN']) && (
             <p className="text-sm text-gray-400 w-full mt-4">Want to sell? Update your role in settings or contact support. 📞</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl hover:border-blue-500 transition-colors">
            <h3 className="text-2xl font-bold mb-3 text-blue-400">🎯 Easy Bidding</h3>
            <p className="text-gray-300">Place bids seamlessly. Real-time updates keep you in the action.</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl hover:border-blue-500 transition-colors">
            <h3 className="text-2xl font-bold mb-3 text-blue-400">🚀 Quick Setup</h3>
            <p className="text-gray-300">Sellers can list items and start auctions in minutes. Effortless management.</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl hover:border-blue-500 transition-colors">
            <h3 className="text-2xl font-bold mb-3 text-blue-400">🔒 Secure Platform</h3>
            <p className="text-gray-300">Bid and transact with confidence. Your data and payments are protected.</p>
          </div>
        </div>
      </div>
      <footer className="mt-20 text-gray-500 text-sm">
        © {new Date().getFullYear()} Bidzy Auctions. All rights reserved. Made with 💙.
      </footer>
    </div>
  );
}

export default Home;