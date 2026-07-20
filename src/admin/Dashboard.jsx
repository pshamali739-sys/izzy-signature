import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import OrderDetail from './OrderDetail';
import CustomerModal from './CustomerModal';
import './Admin.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    no_answer: 0,
    rejected: 0,
    total: 0
  });

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
      
      // Calculate statistics
      const allOrders = data.data || [];
      setStats({
        pending: allOrders.filter(o => o.status === 'pending').length,
        confirmed: allOrders.filter(o => o.status === 'confirmed').length,
        no_answer: allOrders.filter(o => o.status === 'no_answer').length,
        rejected: allOrders.filter(o => o.status === 'rejected').length,
        total: allOrders.length
      });
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders(); // Refresh orders and stats
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    if (address.length <= 25) return address;
    return address.substring(0, 25) + '...';
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1 className="h-brand">Izzy Admin</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <main className="admin-main">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card glass-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card glass-card confirmed">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card glass-card no-answer">
            <div className="stat-number">{stats.no_answer}</div>
            <div className="stat-label">No Answer</div>
          </div>
          <div className="stat-card glass-card rejected">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

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
            <option value="no_answer">No Answer</option>
            <option value="rejected">Rejected</option>
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
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Colour</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan="9" style={{textAlign: 'center'}}>No orders found</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="text-accent" style={{fontWeight: 600}}>{o.order_code}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="customer-name-btn"
                        onClick={() => setSelectedCustomer(o)}
                      >
                        {o.customer_name}
                      </button>
                    </td>
                    <td>{o.mobile_number}</td>
                    <td>Custom Order</td>
                    <td>{o.size}</td>
                    <td>{o.colour}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="actions-cell">
                      {o.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn confirm"
                            onClick={() => updateOrderStatus(o.id, 'confirmed')}
                            title="Confirm"
                          >
                            ✅
                          </button>
                          <button 
                            className="action-btn no-answer"
                            onClick={() => updateOrderStatus(o.id, 'no_answer')}
                            title="No Answer"
                          >
                            📞
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => updateOrderStatus(o.id, 'rejected')}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {o.status !== 'pending' && (
                        <button 
                          className="view-details-btn"
                          onClick={() => setSelectedOrderId(o.id)}
                        >
                          View Details
                        </button>
                      )}
                    </td>
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

      {selectedCustomer && (
        <CustomerModal 
          order={selectedCustomer}
          token={token}
          onClose={() => setSelectedCustomer(null)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  );
}
