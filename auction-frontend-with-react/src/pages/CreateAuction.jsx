// src/pages/CreateAuction.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateAuction() {
  const [auction, setAuction] = useState({
    title: '',
    description: '',
    startPrice: '',
    imageUrl: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAuction({ ...auction, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/v1/auction', auction, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('✅ Auction created successfully');
      navigate('/seller');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to create auction');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">🎯 Create Auction</h2>
        <input name="title" placeholder="Title" required value={auction.title} onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600" />
        <textarea name="description" placeholder="Description" required value={auction.description} onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600" />
        <input type="number" name="startPrice" placeholder="Start Price" required value={auction.startPrice} onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600" />
        <input name="imageUrl" placeholder="Image URL" value={auction.imageUrl} onChange={handleChange}
          className="w-full p-2 mb-6 rounded bg-gray-700 text-white border border-gray-600" />
        <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-600 rounded">Create Auction</button>
      </form>
    </div>
  );
}

export default CreateAuction;
