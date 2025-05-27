import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 shadow-md">
        <h1 className="text-2xl font-bold text-green-400">🧭 AuctionHub</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-md transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-10 flex flex-col items-center justify-center gap-8">
        <h2 className="text-4xl font-bold text-center mb-6">
          Welcome to the Ultimate Online Auction Platform! 🛒
        </h2>
        <p className="text-gray-300 text-lg text-center max-w-3xl">
          Bid on exclusive items, sell unique products, and experience real-time live auctions.
        </p>

        {/* Auction Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <img
            src="https://s3.ap-southeast-2.amazonaws.com/app-spoke-sites-au/uploads/sites/383/2023/11/auction-toowoomba.png"
            alt="Auction Item 1"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
          <img
            src="https://t3.ftcdn.net/jpg/01/93/87/90/360_F_193879046_ZsK2TNMYp7d7FX0NNTB6iKKChXOu03iP.jpg"
            alt="Auction Item 2"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
          <img
            src="https://www.shutterstock.com/image-photo/back-view-buyer-showing-auction-260nw-1657604122.jpg"
            alt="Auction Item 3"
            className="rounded-lg shadow-md object-cover w-full h-64"
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
