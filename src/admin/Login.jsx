import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Starfield from '../components/Starfield';
import '../pages/OrderForm.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('izzy_admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  return (
    <div className="page-container">
      <Starfield />
      <div className="form-wrapper glass-card">
        <header className="form-header">
          <h1 className="h-brand">Admin Portal</h1>
          <p>Izzy Signature</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="submit-btn" style={{ marginTop: '2rem' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
