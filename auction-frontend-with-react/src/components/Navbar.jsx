import { useNavigate, Link } from 'react-router-dom'; // Added Link import
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, hasAnyRole, getUserRole } = useAuth(); // Using hasAnyRole or getUserRole

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  const userRole = getUserRole(); // Get current user's role

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-black px-4 sm:px-6 py-3 text-white flex flex-col sm:flex-row justify-between items-center shadow-xl sticky top-0 z-50">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => navigate('/')}>
          Bidzy 拍卖
        </h1>
      </div>
      <div className="flex flex-wrap justify-center sm:justify-end items-center space-x-3 sm:space-x-4 mt-2 sm:mt-0">
        <Link to="/auctions" className="text-white px-3 py-2 hover:text-yellow-400 transition-colors rounded-md text-sm sm:text-base">
          Auctions
        </Link>
        {/* Removed direct /live link, users can find live auctions via /auctions */}
        
        {isAuthenticated() && (userRole === 'SELLER' || userRole === 'ADMIN') && (
          <>
            <Link to="/create-auction" className="text-white px-3 py-2 hover:text-yellow-400 transition-colors rounded-md text-sm sm:text-base">
              + Create
            </Link>
            <Link to="/seller" className="text-white px-3 py-2 hover:text-yellow-400 transition-colors rounded-md text-sm sm:text-base">
              Seller Dashboard
            </Link>
          </>
        )}
        
        {isAuthenticated() && userRole === 'ADMIN' && (
          <Link to="/admin" className="text-white px-3 py-2 hover:text-yellow-400 transition-colors rounded-md text-sm sm:text-base">
            Admin Panel
          </Link>
        )}
        
        {!isAuthenticated() ? (
          <>
            <button 
              onClick={() => navigate('/login')} 
              className="text-white px-3 py-2 hover:bg-yellow-400 hover:text-black transition-colors rounded-md text-sm sm:text-base"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors font-semibold text-sm sm:text-base"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-gray-300 font-medium text-sm sm:text-base">Hi, {user.username}!</span>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors font-semibold text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;