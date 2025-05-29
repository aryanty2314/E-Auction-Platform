import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import CreateAuction from './pages/CreateAuction';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlaceBid from './pages/PlaceBid';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - require authentication */}
            <Route path="/auctions" element={
              <ProtectedRoute>
                <Auctions />
              </ProtectedRoute>
            } />

            {/* Seller routes */}
            <Route path="/create-auction" element={
              <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                <CreateAuction />
              </ProtectedRoute>
            } />

            <Route path="/seller" element={
              <ProtectedRoute roles={['SELLER']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/auction/:id/bid" element={
              <ProtectedRoute roles={['BIDDER']}>
                <PlaceBid />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;