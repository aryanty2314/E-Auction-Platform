import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-6 py-4 text-white flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold cursor-pointer hover:text-gray-200 transition-colors" onClick={() => navigate('/')}>
        Bidzy
      </h1>
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/auctions')} className="hover:underline transition-all hover:text-gray-200">
          Auctions
        </button>
        
        {hasRole('SELLER') && (
          <>
            <button onClick={() => navigate('/create-auction')} className="hover:underline transition-all hover:text-gray-200">
              + Create Auction
            </button>
            <button onClick={() => navigate('/seller')} className="hover:underline transition-all hover:text-gray-200">
              Seller Dashboard
            </button>
          </>
        )}
        
        {hasRole('ADMIN') && (
          <button onClick={() => navigate('/admin')} className="hover:underline transition-all hover:text-gray-200">
            Admin Dashboard
          </button>
        )}
        
        {!isAuthenticated() ? (
          <>
            <button onClick={() => navigate('/login')} className="hover:underline transition-all hover:text-gray-200">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-gray-100 transition-all">
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-green-200 font-medium">Hi, {user.username}</span>
            <button onClick={handleLogout} className="hover:underline text-red-300 transition-all hover:text-red-200">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;