// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleCreateAuction = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'SELLER') {
      navigate('/create-auction');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-4">Welcome to AuctionHub</h1>
      <p className="text-xl mb-8">Your one-stop platform for online auctions</p>
      <div className="space-x-4">
        <button onClick={() => navigate('/login')} className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200">Login</button>
        <button onClick={() => navigate('/register')} className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200">Sign Up</button>
        <button onClick={handleCreateAuction} className="bg-green-500 px-6 py-2 rounded hover:bg-green-600">Create Auction</button>
      </div>
    </div>
  );
}

export default Home;
