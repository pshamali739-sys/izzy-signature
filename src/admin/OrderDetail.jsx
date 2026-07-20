import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import './Admin.css';

export default function OrderDetail({ id, token, onClose, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(console.error);
  }, [id, token]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      setOrder(data);
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="h-brand">Order {order.order_code}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="detail-group">
            <label>Current Status</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <StatusBadge status={order.status} />
              <select 
                value={order.status} 
                onChange={handleStatusChange} 
                disabled={updating}
                style={{ width: 'auto', padding: '0.4rem' }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>Customer Name</label>
              <p>{order.customer_name}</p>
            </div>
            <div className="detail-item">
              <label>Mobile Number</label>
              <p>{order.mobile_number}</p>
            </div>
            <div className="detail-item">
              <label>Size</label>
              <p>{order.size}</p>
            </div>
            <div className="detail-item">
              <label>Colour</label>
              <p>{order.colour}</p>
            </div>
            <div className="detail-item full-width">
              <label>Delivery Address</label>
              <p>{order.address}</p>
            </div>
            <div className="detail-item full-width">
              <label>Order Notes</label>
              <p>{order.notes || <span style={{color:'var(--text-muted)'}}>None</span>}</p>
            </div>
            <div className="detail-item">
              <label>Created At</label>
              <p>{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="detail-item">
              <label>Last Updated</label>
              <p>{new Date(order.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
