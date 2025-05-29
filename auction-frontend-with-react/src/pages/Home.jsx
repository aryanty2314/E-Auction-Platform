import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Correct path

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, hasAnyRole, user } = useAuth(); // Added user to access role for button text

  const handleCreateAuction = () => {
    if (isAuthenticated() && hasAnyRole(['SELLER', 'ADMIN'])) {
      navigate('/create-auction');
    } else if (isAuthenticated()) {
      // If authenticated but not seller/admin, maybe show a message or navigate to auctions
      // For now, let's navigate to auctions. Or show a toast "Only sellers can create auctions."
      navigate('/auctions'); 
    } else {
      navigate('/login'); // If not authenticated, go to login
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
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white text-center px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Added an icon/logo placeholder */}
        <div className="text-6xl mb-6 animate-bounce">🎉</div> 
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Bidzy</span>
        </h1>
        <p className="text-xl sm:text-2xl mb-12 text-gray-100">
          Your premier destination for exciting online auctions. Find rare items or sell your treasures!
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 mb-12">
          {!isAuthenticated() ? (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted} 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
              >
                Get Started
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/auctions')} 
              className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
            >
              Browse Auctions
            </button>
          )}
          
          {/* Conditional "Create Auction" button */}
          {isAuthenticated() && hasAnyRole(['SELLER', 'ADMIN']) && (
            <button 
              onClick={handleCreateAuction} 
              className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
            >
              Create Auction
            </button>
          )}
           {/* If user is logged in but not a seller/admin, maybe a different CTA */}
          {isAuthenticated() && !hasAnyRole(['SELLER', 'ADMIN']) && (
             <p className="text-sm text-gray-200 w-full">Want to sell? Update your role or contact support.</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm shadow-xl">
            <h3 className="text-2xl font-bold mb-3 text-yellow-300">🎯 Easy Bidding</h3>
            <p className="text-gray-200">Place bids on your favorite items with a seamless and intuitive interface. Real-time updates keep you in the action.</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm shadow-xl">
            <h3 className="text-2xl font-bold mb-3 text-green-300">🚀 Quick Setup</h3>
            <p className="text-gray-200">Sellers can list items and start auctions in minutes. Manage your listings effortlessly from your dashboard.</p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm shadow-xl">
            <h3 className="text-2xl font-bold mb-3 text-pink-300">🔒 Secure Platform</h3>
            <p className="text-gray-200">We prioritize your security. Bid and transact with confidence, knowing your data and payments are protected.</p>
          </div>
        </div>
      </div>
      <footer className="mt-16 text-gray-300 text-sm">
        © {new Date().getFullYear()} Bidzy Auctions. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;