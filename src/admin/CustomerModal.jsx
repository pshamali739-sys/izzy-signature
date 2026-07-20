import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import './Admin.css';

export default function CustomerModal({ order, token, onClose, onUpdated }) {
  const [customerData, setCustomerData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      fetchCustomerData();
    }
  }, [order]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch all orders for this customer (by phone number)
      const res = await fetch(`/api/orders?search=${order.mobile_number}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const allOrders = data.data || [];
      const customerOrders = allOrders.filter(o => o.mobile_number === order.mobile_number);
      
      // Sort by date (newest first)
      customerOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrderHistory(customerOrders);
      
      // Calculate customer statistics
      const stats = {
        total: customerOrders.length,
        confirmed: customerOrders.filter(o => o.status === 'confirmed').length,
        rejected: customerOrders.filter(o => o.status === 'rejected').length,
        no_answer: customerOrders.filter(o => o.status === 'no_answer').length,
        pending: customerOrders.filter(o => o.status === 'pending').length,
      };
      
      setCustomerData({
        ...order,
        stats,
        customerSince: customerOrders.length > 0 
          ? new Date(Math.min(...customerOrders.map(o => new Date(o.created_at))))
          : new Date(order.created_at)
      });
    } catch (err) {
      console.error('Error fetching customer data:', err);
      showToast('Failed to load customer data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(order.address);
    showToast('Address copied successfully');
  };

  const callCustomer = () => {
    window.open(`tel:${order.mobile_number}`);
  };

  const whatsappCustomer = () => {
    const message = `Hello ${order.customer_name},\nThis is regarding your order ${order.order_code}.\nThank you.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${order.mobile_number.replace(/^0/, '94')}?text=${encodedMessage}`);
  };

  const updateOrderStatus = async (newStatus, requireConfirmation = false) => {
    if (requireConfirmation) {
      if (!window.confirm(`Are you sure you want to reject this order?`)) {
        return;
      }
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Order ${newStatus.replace('_', ' ')} successfully`);
        await fetchCustomerData(); // Refresh modal data
        onUpdated(); // Refresh table
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const truncateAddress = (address) => {
    if (address.length <= 30) return address;
    return address.substring(0, 30) + '...';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Loading customer data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content customer-modal" onClick={e => e.stopPropagation()}>
        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="modal-header">
          <h2>Customer Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Customer Information */}
        <div className="customer-section">
          <h3>Customer Information</h3>
          <div className="customer-grid">
            <div className="customer-item">
              <label>Name</label>
              <p>{order.customer_name}</p>
            </div>
            <div className="customer-item">
              <label>Phone</label>
              <p>{order.mobile_number}</p>
            </div>
            <div className="customer-item full-width">
              <label>Address</label>
              <p>{order.address}</p>
              <button className="copy-btn" onClick={copyAddress}>
                📋 Copy Address
              </button>
            </div>
            <div className="customer-item">
              <label>Customer Since</label>
              <p>{formatDate(customerData?.customerSince)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-card call" onClick={callCustomer}>
            <span className="action-icon">📞</span>
            <span>Call Customer</span>
          </button>
          <button className="action-card whatsapp" onClick={whatsappCustomer}>
            <span className="action-icon">💬</span>
            <span>WhatsApp</span>
          </button>
          {order.status === 'pending' && (
            <>
              <button 
                className="action-card confirm" 
                onClick={() => updateOrderStatus('confirmed')}
                disabled={updating}
              >
                <span className="action-icon">✅</span>
                <span>Confirm Order</span>
              </button>
              <button 
                className="action-card no-answer" 
                onClick={() => updateOrderStatus('no_answer')}
                disabled={updating}
              >
                <span className="action-icon">📵</span>
                <span>No Answer</span>
              </button>
              <button 
                className="action-card reject" 
                onClick={() => updateOrderStatus('rejected', true)}
                disabled={updating}
              >
                <span className="action-icon">❌</span>
                <span>Reject Order</span>
              </button>
            </>
          )}
        </div>

        {/* Current Order */}
        <div className="order-section">
          <h3>Current Order</h3>
          <div className="order-card current-order">
            <div className="order-header">
              <span className="order-code">{order.order_code}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="order-details">
              <div className="order-detail-row">
                <span>Size:</span>
                <span>{order.size}</span>
              </div>
              <div className="order-detail-row">
                <span>Colour:</span>
                <span>{order.colour}</span>
              </div>
              <div className="order-detail-row">
                <span>Order Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Summary */}
        {customerData?.stats && (
          <div className="customer-summary">
            <h3>Customer Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-number">{customerData.stats.total}</span>
                <span className="summary-label">Total Orders</span>
              </div>
              <div className="summary-item">
                <span className="summary-number confirmed">{customerData.stats.confirmed}</span>
                <span className="summary-label">Confirmed</span>
              </div>
              <div className="summary-item">
                <span className="summary-number pending">{customerData.stats.pending}</span>
                <span className="summary-label">Pending</span>
              </div>
              <div className="summary-item">
                <span className="summary-number rejected">{customerData.stats.rejected}</span>
                <span className="summary-label">Rejected</span>
              </div>
            </div>
          </div>
        )}

        {/* Order History */}
        <div className="order-history">
          <h3>Order History</h3>
          {orderHistory.length === 0 ? (
            <p className="empty-state">No previous orders found</p>
          ) : (
            <div className="history-timeline">
              {orderHistory.map((historyOrder, index) => (
                <div 
                  key={historyOrder.id} 
                  className={`history-card ${historyOrder.id === order.id ? 'current' : ''}`}
                >
                  <div className="history-header">
                    <span className="history-code">{historyOrder.order_code}</span>
                    <StatusBadge status={historyOrder.status} />
                  </div>
                  <div className="history-details">
                    <div className="history-detail">
                      <span>Size:</span>
                      <span>{historyOrder.size}</span>
                    </div>
                    <div className="history-detail">
                      <span>Colour:</span>
                      <span>{historyOrder.colour}</span>
                    </div>
                    <div className="history-detail">
                      <span>Date:</span>
                      <span>{formatDate(historyOrder.created_at)}</span>
                    </div>
                  </div>
                  {historyOrder.id === order.id && (
                    <span className="current-badge">Current Order</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
