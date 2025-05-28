// src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 px-6 py-4 text-white flex justify-between items-center">
      <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>AuctionHub</h1>
      <div className="space-x-4">
        <button onClick={() => navigate('/auctions')} className="hover:underline">Auctions</button>
        {role === 'SELLER' && <button onClick={() => navigate('/create-auction')} className="hover:underline">+ Create Auction</button>}
        {role === 'SELLER' && <button onClick={() => navigate('/seller')} className="hover:underline">Seller Dashboard</button>}
        {role === 'ADMIN' && <button onClick={() => navigate('/admin')} className="hover:underline">Admin Dashboard</button>}
        {!username ? (
          <>
            <button onClick={() => navigate('/login')} className="hover:underline">Login</button>
            <button onClick={() => navigate('/register')} className="hover:underline">Sign Up</button>
          </>
        ) : (
          <>
            <span className="text-green-200">Hi, {username}</span>
            <button onClick={logout} className="hover:underline text-red-300">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
