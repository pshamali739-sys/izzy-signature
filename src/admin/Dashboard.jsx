import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import OrderDetail from './OrderDetail';
import './Admin.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [token, statusFilter, search]);

  const fetchOrders = async () => {
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.append('status', statusFilter);
      if (search) qs.append('search', search);

      const res = await fetch(`/api/orders?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('izzy_admin_token');
        navigate('/admin/login');
        return;
      }
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('izzy_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1 className="h-brand">Izzy Admin</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <main className="admin-main">
        <div className="filters glass-card">
          <input 
            type="text" 
            placeholder="Search name or mobile..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-container glass-card">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Code</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Size</th>
                  <th>Colour</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders found</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id} onClick={() => setSelectedOrderId(o.id)}>
                    <td className="text-accent" style={{fontWeight: 600}}>{o.order_code}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.size}</td>
                    <td>{o.colour}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {selectedOrderId && (
        <OrderDetail 
          id={selectedOrderId} 
          token={token} 
          onClose={() => setSelectedOrderId(null)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  );
}
