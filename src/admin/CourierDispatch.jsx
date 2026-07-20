import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import './Admin.css';

export default function CourierDispatch() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dispatchSummary, setDispatchSummary] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchReadyOrders();
  }, [token]);

  const fetchReadyOrders = async () => {
    try {
      const res = await fetch('/api/orders?status=ready_for_courier', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleOrderSelection = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    setSelectedOrders(new Set(orders.map(o => o.id)));
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const prepareDispatch = (sendAll = false) => {
    const ordersToDispatch = sendAll ? orders : orders.filter(o => selectedOrders.has(o.id));
    
    if (ordersToDispatch.length === 0) {
      showToast('Please select orders to dispatch', 'error');
      return;
    }

    const totalCOD = ordersToDispatch.reduce((sum, order) => sum + (order.amount || 3500), 0);

    setDispatchSummary({
      orders: ordersToDispatch,
      totalOrders: ordersToDispatch.length,
      totalCOD: totalCOD,
      sendAll
    });
    setShowConfirmModal(true);
  };

  const dispatchOrders = async () => {
    if (!dispatchSummary) return;

    setDispatching(true);
    try {
      const res = await fetch('/api/courier/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orders: dispatchSummary.orders })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Successfully dispatched ${data.results.filter(r => r.success).length} orders`);
        setShowConfirmModal(false);
        setSelectedOrders(new Set());
        fetchReadyOrders();
      } else {
        showToast('Failed to dispatch orders', 'error');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      showToast('Failed to dispatch orders', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1 className="h-brand">Courier Dispatch</h1>
        <button className="logout-btn" onClick={() => navigate('/admin')}>Back to Dashboard</button>
      </header>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <main className="admin-main">
        <div className="dispatch-header glass-card">
          <div className="dispatch-stats">
            <div className="stat-item">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Ready Orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                Rs.{orders.reduce((sum, o) => sum + (o.amount || 3500), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total COD</span>
            </div>
          </div>
          <div className="dispatch-actions">
            <button 
              className="action-btn"
              onClick={selectAllOrders}
              disabled={orders.length === 0}
            >
              Select All
            </button>
            <button 
              className="action-btn"
              onClick={clearSelection}
              disabled={selectedOrders.size === 0}
            >
              Clear Selection
            </button>
            <button 
              className="action-btn confirm"
              onClick={() => prepareDispatch(false)}
              disabled={selectedOrders.size === 0}
            >
              Send Selected ({selectedOrders.size})
            </button>
            <button 
              className="action-btn confirm"
              onClick={() => prepareDispatch(true)}
              disabled={orders.length === 0}
            >
              Send All ({orders.length})
            </button>
          </div>
        </div>

        <div className="table-container glass-card">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={selectedOrders.size === orders.length ? clearSelection : selectAllOrders}
                    />
                  </th>
                  <th>Order Code</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan="8" style={{textAlign: 'center'}}>No orders ready for courier</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id} className={selectedOrders.has(o.id) ? 'selected' : ''}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedOrders.has(o.id)}
                        onChange={() => toggleOrderSelection(o.id)}
                      />
                    </td>
                    <td className="text-accent" style={{fontWeight: 600}}>{o.order_code}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.mobile_number}</td>
                    <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {o.address}
                    </td>
                    <td>Rs.{(o.amount || 3500).toLocaleString()}</td>
                    <td>{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showConfirmModal && dispatchSummary && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Dispatch</h2>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>

            <div className="dispatch-summary">
              <h3>Dispatch Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Total Orders:</span>
                  <span>{dispatchSummary.totalOrders}</span>
                </div>
                <div className="summary-item">
                  <span>Total COD Amount:</span>
                  <span>Rs.{dispatchSummary.totalCOD.toLocaleString()}</span>
                </div>
              </div>

              <div className="orders-preview">
                <h4>Orders to be dispatched:</h4>
                <div className="preview-list">
                  {dispatchSummary.orders.map(order => (
                    <div key={order.id} className="preview-item">
                      <span>{order.order_code}</span>
                      <span>{order.customer_name}</span>
                      <span>Rs.{(order.amount || 3500).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={dispatching}
                >
                  Cancel
                </button>
                <button 
                  className="action-btn confirm"
                  onClick={dispatchOrders}
                  disabled={dispatching}
                >
                  {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
