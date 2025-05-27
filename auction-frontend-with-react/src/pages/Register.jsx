import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'BIDDER'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/register', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role);

      alert('✅ Registered successfully!');
      navigate('/auctions');
    } catch (err) {
      console.error(err);
      alert('❌ Registration failed. Check details or user might already exist.');
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">📝 Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="BIDDER">BIDDER</option>
              <option value="SELLER">SELLER</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
