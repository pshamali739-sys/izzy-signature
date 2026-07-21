import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import DataTable from './components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock,
  DollarSign,
  Check,
  X,
  Send,
  Download,
  Printer,
  AlertCircle
} from 'lucide-react';

export default function CourierManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dispatchSummary, setDispatchSummary] = useState(null);
  const [stats, setStats] = useState({
    ready: 0,
    sent: 0,
    inTransit: 0,
    delivered: 0,
    totalCOD: 0
  });

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
      
      // Calculate stats
      const allOrders = data.data || [];
      setStats({
        ready: allOrders.length,
        sent: 0, // Would need separate endpoint
        inTransit: 0,
        delivered: 0,
        totalCOD: allOrders.reduce((sum, order) => sum + (order.amount || 3500), 0)
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
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
        setShowConfirmModal(false);
        setSelectedOrders(new Set());
        fetchReadyOrders();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  const columns = [
    {
      accessor: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedOrders.size === orders.length && orders.length > 0}
          onChange={selectedOrders.size === orders.length ? clearSelection : selectAllOrders}
          className="w-4 h-4 rounded border-white/20 bg-white/10"
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedOrders.has(row.id)}
          onChange={() => toggleOrderSelection(row.id)}
          className="w-4 h-4 rounded border-white/20 bg-white/10"
        />
      )
    },
    {
      accessor: 'order_code',
      header: 'Order Code',
      sortable: true,
      className: 'font-semibold text-[#e5b962]',
      cell: (row) => row.order_code
    },
    {
      accessor: 'customer_name',
      header: 'Customer',
      sortable: true,
      cell: (row) => row.customer_name
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
        <div className="max-w-xs truncate" title={row.address}>
          {row.address}
        </div>
      )
    },
    {
      accessor: 'amount',
      header: 'COD Amount',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Rs.{(row.amount || 3500).toLocaleString()}</span>
        </div>
      )
    },
    {
      accessor: 'created_at',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.created_at).toLocaleDateString()
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ready for Dispatch"
            value={stats.ready}
            type="pending"
            icon={Package}
          />
          <KPICard
            title="Sent to Courier"
            value={stats.sent}
            type="total"
            icon={Send}
          />
          <KPICard
            title="In Transit"
            value={stats.inTransit}
            type="total"
            icon={Truck}
          />
          <KPICard
            title="Total COD Value"
            value={`Rs.${stats.totalCOD.toLocaleString()}`}
            type="cod"
            icon={DollarSign}
          />
        </div>

        {/* Dispatch Actions */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Courier Dispatch</h2>
              <p className="text-gray-400">
                {selectedOrders.size} of {orders.length} orders selected
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={selectAllOrders}
                disabled={orders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Select All
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedOrders.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={() => prepareDispatch(false)}
                disabled={selectedOrders.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#a98be8] to-[#e5b962] hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send Selected ({selectedOrders.size})
              </button>
              <button
                onClick={() => prepareDispatch(true)}
                disabled={orders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send All ({orders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Orders Ready for Dispatch</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors">
                <Printer className="w-4 h-4" />
                Print Labels
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            emptyMessage="No orders ready for courier dispatch"
          />
        </div>
      </div>

      {/* Confirm Dispatch Modal */}
      {showConfirmModal && dispatchSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowConfirmModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#16182e] border border-white/10 rounded-2xl max-w-lg w-full p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#e5b962]/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#e5b962]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Confirm Dispatch</h2>
                <p className="text-gray-400">Review before sending to courier</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <span className="text-gray-400">Total Orders</span>
                <span className="text-xl font-bold text-white">{dispatchSummary.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <span className="text-gray-400">Total COD Amount</span>
                <span className="text-xl font-bold text-[#e5b962]">
                  Rs.{dispatchSummary.totalCOD.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={dispatching}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={dispatchOrders}
                disabled={dispatching}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#a98be8] to-[#e5b962] hover:opacity-90 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
              >
                {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
