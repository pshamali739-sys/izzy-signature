import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import DataTable from './components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Phone,
  MessageSquare,
  Copy,
  Eye,
  Filter,
  Search,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

export default function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    noAnswer: 0,
    readyCourier: 0,
    sentCourier: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0
  });

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [token, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.append('status', statusFilter);
      if (dateFilter !== 'all') {
        const now = new Date();
        if (dateFilter === 'today') {
          qs.append('date', now.toDateString());
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
          qs.append('from', weekAgo.toISOString());
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
          qs.append('from', monthAgo.toISOString());
        }
      }

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
      
      const allOrders = data.data || [];
      setStats({
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        confirmed: allOrders.filter(o => o.status === 'confirmed').length,
        rejected: allOrders.filter(o => o.status === 'rejected').length,
        noAnswer: allOrders.filter(o => o.status === 'no_answer').length,
        readyCourier: allOrders.filter(o => o.status === 'ready_for_courier').length,
        sentCourier: allOrders.filter(o => o.status === 'sent_to_courier').length,
        inTransit: allOrders.filter(o => o.status === 'in_transit').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length,
        returned: allOrders.filter(o => o.status === 'returned').length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const columns = [
    {
      accessor: 'order_code',
      header: 'Order Code',
      sortable: true,
      className: 'font-semibold text-[#e5b962]',
      cell: (row) => row.order_code
    },
    {
      accessor: 'created_at',
      header: 'Date',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(row.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      accessor: 'customer_name',
      header: 'Customer',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>{row.customer_name}</span>
        </div>
      )
    },
    {
      accessor: 'mobile_number',
      header: 'Phone',
      cell: (row) => row.mobile_number
    },
    {
      accessor: 'address',
      header: 'Address',
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-xs">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{row.address}</span>
        </div>
      )
    },
    {
      accessor: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => `Rs.${(row.amount || 3500).toLocaleString()}`
    },
    {
      accessor: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(row.id, 'confirmed');
                }}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(row.id, 'no_answer');
                }}
                className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                title="No Answer"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(row.id, 'rejected');
                }}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(row.mobile_number);
            }}
            className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors"
            title="Copy Phone"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${row.mobile_number}`);
            }}
            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${row.mobile_number.replace(/^0/, '94')}`);
            }}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(row);
            }}
            className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total"
            value={stats.total}
            type="total"
            icon={Package}
          />
          <KPICard
            title="Pending"
            value={stats.pending}
            type="pending"
            icon={Clock}
          />
          <KPICard
            title="Confirmed"
            value={stats.confirmed}
            type="confirmed"
            icon={CheckCircle}
          />
          <KPICard
            title="Rejected"
            value={stats.rejected}
            type="alert"
            icon={XCircle}
          />
          <KPICard
            title="No Answer"
            value={stats.noAnswer}
            type="pending"
            icon={Phone}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Ready Courier"
            value={stats.readyCourier}
            type="total"
            icon={Package}
          />
          <KPICard
            title="Sent Courier"
            value={stats.sentCourier}
            type="total"
          />
          <KPICard
            title="In Transit"
            value={stats.inTransit}
            type="total"
          />
          <KPICard
            title="Delivered"
            value={stats.delivered}
            type="confirmed"
            icon={CheckCircle}
          />
        </div>

        {/* Filters */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0b16] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a98be8]/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0a0b16] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a98be8]/50"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="no_answer">No Answer</option>
              <option value="rejected">Rejected</option>
              <option value="ready_for_courier">Ready For Courier</option>
              <option value="sent_to_courier">Sent To Courier</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0a0b16] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a98be8]/50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">All Orders</h2>

          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No orders found"
          />
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#16182e] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.order_code}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Copy className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Name</div>
                    <div className="text-white font-medium">{selectedOrder.customer_name}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Phone</div>
                    <div className="text-white font-medium">{selectedOrder.mobile_number}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 col-span-2">
                    <div className="text-sm text-gray-400 mb-1">Address</div>
                    <div className="text-white font-medium">{selectedOrder.address}</div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Product</div>
                    <div className="text-white font-medium">Ladies Kurti</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Size</div>
                    <div className="text-white font-medium">{selectedOrder.size}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Colour</div>
                    <div className="text-white font-medium">{selectedOrder.colour}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-white font-medium">Rs.{(selectedOrder.amount || 3500).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-400 font-medium transition-colors"
                  >
                    Confirm Order
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'no_answer');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 font-medium transition-colors"
                  >
                    No Answer
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'rejected');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-medium transition-colors"
                  >
                    Reject Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
