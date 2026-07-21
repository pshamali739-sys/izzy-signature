import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import DataTable from './components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp,
  Calendar,
  Package,
  DollarSign,
  MessageSquare,
  Copy,
  Eye,
  Star,
  AlertTriangle
} from 'lucide-react';

export default function CustomerCRM() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    repeat: 0,
    new: 0,
    risk: 0,
    lifetimeValue: 0
  });

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('izzy_admin_token');
        navigate('/admin/login');
        return;
      }
      
      const data = await res.json();
      const orders = data.data || [];
      
      // Group orders by customer phone
      const customerMap = new Map();
      
      orders.forEach(order => {
        const phone = order.mobile_number;
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            phone,
            name: order.customer_name,
            address: order.address,
            orders: [],
            totalSpent: 0,
            orderCount: 0,
            lastOrder: order.created_at,
            firstOrder: order.created_at
          });
        }
        
        const customer = customerMap.get(phone);
        customer.orders.push(order);
        customer.totalSpent += (order.amount || 3500);
        customer.orderCount += 1;
        
        if (new Date(order.created_at) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.created_at;
        }
        if (new Date(order.created_at) < new Date(customer.firstOrder)) {
          customer.firstOrder = order.created_at;
        }
      });
      
      const customerArray = Array.from(customerMap.values());
      setCustomers(customerArray);
      
      // Calculate stats
      const repeatCustomers = customerArray.filter(c => c.orderCount > 1);
      const newCustomers = customerArray.filter(c => {
        const daysSinceFirst = (Date.now() - new Date(c.firstOrder)) / (1000 * 60 * 60 * 24);
        return daysSinceFirst <= 30;
      });
      const riskCustomers = customerArray.filter(c => {
        const rejected = c.orders.filter(o => o.status === 'rejected').length;
        return rejected >= 2;
      });
      
      setStats({
        total: customerArray.length,
        repeat: repeatCustomers.length,
        new: newCustomers.length,
        risk: riskCustomers.length,
        lifetimeValue: customerArray.reduce((sum, c) => sum + c.totalSpent, 0)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const columns = [
    {
      accessor: 'name',
      header: 'Customer Name',
      sortable: true,
      className: 'font-semibold text-white',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a98be8] to-[#e5b962] flex items-center justify-center text-white font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-xs text-gray-400">{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      accessor: 'orderCount',
      header: 'Orders',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{row.orderCount}</span>
        </div>
      )
    },
    {
      accessor: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Rs.{row.totalSpent.toLocaleString()}</span>
        </div>
      )
    },
    {
      accessor: 'lastOrder',
      header: 'Last Order',
      sortable: true,
      cell: (row) => new Date(row.lastOrder).toLocaleDateString()
    },
    {
      accessor: 'customerType',
      header: 'Type',
      cell: (row) => {
        const rejected = row.orders.filter(o => o.status === 'rejected').length;
        if (rejected >= 2) {
          return (
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
              Risk
            </span>
          );
        }
        if (row.orderCount > 1) {
          return (
            <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
              Repeat
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            New
          </span>
        );
      }
    },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(row.phone);
            }}
            className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 transition-colors"
            title="Copy Phone"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${row.phone}`);
            }}
            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${row.phone.replace(/^0/, '94')}`);
            }}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(row);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Customers"
            value={stats.total}
            type="customers"
            icon={Users}
            trend="up"
            trendValue="+15%"
          />
          <KPICard
            title="Repeat Customers"
            value={stats.repeat}
            type="confirmed"
            icon={Star}
          />
          <KPICard
            title="New Customers (30d)"
            value={stats.new}
            type="total"
            icon={Users}
          />
          <KPICard
            title="Risk Customers"
            value={stats.risk}
            type="alert"
            icon={AlertTriangle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Lifetime Value"
            value={`Rs.${stats.lifetimeValue.toLocaleString()}`}
            type="cod"
            icon={DollarSign}
            trend="up"
            trendValue="+22%"
          />
          <KPICard
            title="Avg. Order Value"
            value="Rs.3,500"
            type="confirmed"
            icon={TrendingUp}
          />
        </div>

        {/* Customers Table */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Customer Directory</h2>

          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No customers found"
          />
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCustomer(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#16182e] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a98be8] to-[#e5b962] flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                  <p className="text-gray-400">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Copy className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{selectedCustomer.orderCount}</div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#e5b962]">Rs.{selectedCustomer.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Spent</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(selectedCustomer.totalSpent / selectedCustomer.orderCount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Avg. Order Value</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">
                    {Math.floor((Date.now() - new Date(selectedCustomer.firstOrder)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-400">Days as Customer</div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-white">Address</span>
                </div>
                <p className="text-gray-300">{selectedCustomer.address}</p>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order History</h3>
                <div className="space-y-3">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#a98be8]/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#a98be8]" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{order.order_code}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <span className="text-white font-medium">Rs.{(order.amount || 3500).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
