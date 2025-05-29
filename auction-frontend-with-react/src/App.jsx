import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import CreateAuction from './pages/CreateAuction';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PlaceBid from './pages/PlaceBid';
import LiveAuctionPage from './pages/LiveAuctionPage';

function App() {
  return (
    <ErrorBoundary>
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

              <Route path="/live/:id" element={
                <ProtectedRoute>
                  <LiveAuctionPage />
                </ProtectedRoute>
              } />

              {/* Bidding route */}
              <Route path="/auction/:id/bid" element={
                <ProtectedRoute roles={['BIDDER', 'ADMIN', 'SELLER']}>
                  <PlaceBid />
                </ProtectedRoute>
              } />

              {/* Seller routes */}
              <Route path="/create-auction" element={
                <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                  <CreateAuction />
                </ProtectedRoute>
              } />

              <Route path="/seller" element={
                <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;