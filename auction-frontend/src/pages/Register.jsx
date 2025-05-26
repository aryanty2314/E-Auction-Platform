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

      // Save token
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
    <div style={{ padding: '2rem' }}>
      <h2>📝 Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label><br />
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label><br />
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label><br />
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Role:</label><br />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="BIDDER">BIDDER</option>
            <option value="SELLER">SELLER</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>Register</button>
      </form>
    </div>
  );
}

export default Register;
