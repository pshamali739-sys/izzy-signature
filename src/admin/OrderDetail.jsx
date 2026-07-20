import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import './Admin.css';

export default function OrderDetail({ id, token, onClose, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, token]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Fetch current order
      const orderRes = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      setOrder(orderData);

      // Fetch customer history by phone number
      const historyRes = await fetch(`/api/orders?search=${orderData.mobile_number}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const historyData = await historyRes.json();
      
      // Filter out current order and sort by date
      const previousOrders = (historyData.data || [])
        .filter(o => o.id !== id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setCustomerHistory(previousOrders);
    } catch (err) {
      console.error('Error fetching order details:', err);
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
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        showToast(`Order ${newStatus.replace('_', ' ')} successfully`);
        onUpdated();
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateLifetimeValue = () => {
    const orderValue = 3500; // Fixed price as per example
    const historyValue = customerHistory.length * orderValue;
    return orderValue + historyValue;
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Loading order details...
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="modal-header">
          <h2>Order #{order.order_code}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Status Section */}
        <div className="status-section">
          <h3>STATUS:</h3>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer Details */}
        <div className="customer-section">
          <h3>CUSTOMER DETAILS</h3>
          <div className="customer-info-grid">
            <div className="info-item">
              <label>Name:</label>
              <p>{order.customer_name}</p>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <p>{order.mobile_number}</p>
            </div>
            <div className="info-item full-width">
              <label>Address:</label>
              <p>{order.address}</p>
            </div>
          </div>
          <div className="customer-actions">
            <button className="action-btn-small call" onClick={callCustomer}>
              📞 Call
            </button>
            <button className="action-btn-small whatsapp" onClick={whatsappCustomer}>
              💬 WhatsApp
            </button>
            <button className="action-btn-small copy" onClick={copyAddress}>
              📋 Copy Address
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="order-details-section">
          <h3>ORDER DETAILS</h3>
          <div className="order-info-grid">
            <div className="info-item">
              <label>Product:</label>
              <p>Ladies Kurti</p>
            </div>
            <div className="info-item">
              <label>Size:</label>
              <p>{order.size}</p>
            </div>
            <div className="info-item">
              <label>Colour:</label>
              <p>{order.colour}</p>
            </div>
            <div className="info-item">
              <label>Qty:</label>
              <p>1</p>
            </div>
            <div className="info-item">
              <label>Amount:</label>
              <p>Rs.3500</p>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <p>{formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {order.status === 'pending' && (
          <div className="quick-actions-section">
            <h3>QUICK ACTIONS</h3>
            <div className="quick-actions-buttons">
              <button 
                className="quick-action-btn confirm"
                onClick={() => updateOrderStatus('confirmed')}
                disabled={updating}
              >
                ✅ Confirm Order
              </button>
              <button 
                className="quick-action-btn no-answer"
                onClick={() => updateOrderStatus('no_answer')}
                disabled={updating}
              >
                📵 No Answer
              </button>
              <button 
                className="quick-action-btn reject"
                onClick={() => updateOrderStatus('rejected', true)}
                disabled={updating}
              >
                ❌ Reject Order
              </button>
            </div>
          </div>
        )}

        {/* Customer History */}
        <div className="customer-history-section">
          <h3>CUSTOMER HISTORY</h3>
          <div className="history-summary">
            <p>Previous Orders ({customerHistory.length})</p>
          </div>
          
          {customerHistory.length > 0 ? (
            <div className="history-list">
              {customerHistory.map((historyOrder) => (
                <div key={historyOrder.id} className="history-item">
                  <div className="history-header">
                    <span className="history-order-code">{historyOrder.order_code}</span>
                    <span className="history-product">Ladies Kurti</span>
                    <StatusBadge status={historyOrder.status} />
                    <span className="history-amount">Rs.3500</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-history">No previous orders</p>
          )}

          <div className="lifetime-summary">
            <div className="summary-item">
              <span>Total Orders:</span>
              <span>{customerHistory.length + 1}</span>
            </div>
            <div className="summary-item">
              <span>Lifetime Value:</span>
              <span>Rs.{calculateLifetimeValue()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
