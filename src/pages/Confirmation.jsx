import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Starfield from '../components/Starfield';
import './OrderForm.css';

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-container">
      <Starfield />
      <div className="form-wrapper glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
        <h1 className="h-brand" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Thank You!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your order has been received. Please save your order code below for future reference.
        </p>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--accent-lavender)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-lavender)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            Order Code
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
            {order.order_code}
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="submit-btn" 
          style={{ width: '100%', maxWidth: '250px' }}
        >
          Place Another Order
        </button>
      </div>
    </div>
  );
}
