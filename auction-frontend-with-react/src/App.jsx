// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Auctions from './pages/Auctions';
import CreateAuction from './pages/CreateAuction';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/auctions" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/auctions" />} />
        <Route path="/auctions" element={token ? <Auctions /> : <Navigate to="/login" />} />
        <Route path="/create-auction" element={token && role === 'SELLER' ? <CreateAuction /> : <Navigate to="/login" />} />
        <Route path="/seller" element={token && role === 'SELLER' ? <SellerDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token && role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1 className="text-center text-white mt-10">404 Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
