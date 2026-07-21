import React, { useState } from 'react';
import { X, Phone, MessageSquare, Copy, CheckCircle, PhoneOff, XCircle } from 'lucide-react';

export default function CustomerDetailsModal({ order, onClose, onStatusUpdate }) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(order.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const callCustomer = () => {
    window.open(`tel:${order.mobile_number}`);
  };

  const whatsappCustomer = () => {
    const message = encodeURIComponent(`Hello ${order.customer_name}, regarding your order ${order.order_code}`);
    window.open(`https://wa.me/${order.mobile_number.replace(/^0/, '94')}?text=${message}`);
  };

  const handleStatusUpdate = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] rounded-2xl border border-white/8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#111827] border-b border-white/8 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Customer Details</h2>
            <p className="text-[#94A3B8] text-sm">{order.order_code}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/8">
            <h3 className="text-white font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[#94A3B8] text-sm">Name</label>
                <p className="text-white font-medium">{order.customer_name}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Phone</label>
                <p className="text-white font-medium">{order.mobile_number}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Address</label>
                <div className="flex items-start gap-2">
                  <p className="text-white font-medium flex-1">{order.address}</p>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#94A3B8]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={callCustomer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Call</span>
              </button>
              <button
                onClick={whatsappCustomer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/8">
            <h3 className="text-white font-semibold mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#94A3B8] text-sm">Product</label>
                <p className="text-white font-medium">Custom Order</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Size</label>
                <p className="text-white font-medium">{order.size}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Colour</label>
                <p className="text-white font-medium">{order.colour}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Amount</label>
                <p className="text-white font-medium">Rs.{(order.amount || 3500).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Status</label>
                <p className="text-white font-medium capitalize">{order.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="text-[#94A3B8] text-sm">Date</label>
                <p className="text-white font-medium">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions for Pending Orders */}
          {order.status === 'pending' && (
            <div className="bg-white/5 rounded-xl p-5 border border-white/8">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Confirm</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate('no_answer')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span className="text-sm font-medium">No Answer</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Reject</span>
                </button>
              </div>
            </div>
          )}

          {/* Customer Statistics */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/8">
            <h3 className="text-white font-semibold mb-4">Customer Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-[#94A3B8] text-sm">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">0</p>
                <p className="text-[#94A3B8] text-sm">Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">0</p>
                <p className="text-[#94A3B8] text-sm">Returned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
