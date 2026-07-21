import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import DataTable from './components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { 
  AlertTriangle, 
  TrendingDown, 
  Shield, 
  Ban,
  Phone,
  MessageSquare,
  Eye,
  AlertCircle,
  XCircle,
  Clock,
  Package,
  Copy
} from 'lucide-react';

export default function RiskDashboard() {
  const navigate = useNavigate();
  const [riskCustomers, setRiskCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    blocked: 0,
    totalRejected: 0,
    totalNoAnswer: 0
  });

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchRiskData();
  }, [token]);

  const fetchRiskData = async () => {
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
      
      // Group orders by customer phone and calculate risk scores
      const customerMap = new Map();
      
      orders.forEach(order => {
        const phone = order.mobile_number;
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            phone,
            name: order.customer_name,
            address: order.address,
            orders: [],
            rejectedCount: 0,
            noAnswerCount: 0,
            confirmedCount: 0,
            totalOrders: 0,
            riskScore: 0,
            riskLevel: 'low'
          });
        }
        
        const customer = customerMap.get(phone);
        customer.orders.push(order);
        customer.totalOrders += 1;
        
        if (order.status === 'rejected') {
          customer.rejectedCount += 1;
        } else if (order.status === 'no_answer') {
          customer.noAnswerCount += 1;
        } else if (order.status === 'confirmed' || order.status === 'delivered') {
          customer.confirmedCount += 1;
        }
      });
      
      // Calculate risk scores
      const customerArray = Array.from(customerMap.values()).map(customer => {
        const rejectionRate = customer.totalOrders > 0 ? (customer.rejectedCount / customer.totalOrders) * 100 : 0;
        const noAnswerRate = customer.totalOrders > 0 ? (customer.noAnswerCount / customer.totalOrders) * 100 : 0;
        
        // Risk calculation
        let riskScore = 0;
        if (customer.rejectedCount >= 3) riskScore += 50;
        else if (customer.rejectedCount >= 2) riskScore += 30;
        else if (customer.rejectedCount >= 1) riskScore += 15;
        
        if (customer.noAnswerCount >= 5) riskScore += 30;
        else if (customer.noAnswerCount >= 3) riskScore += 20;
        else if (customer.noAnswerCount >= 2) riskScore += 10;
        
        if (rejectionRate >= 50) riskScore += 20;
        else if (rejectionRate >= 30) riskScore += 10;
        
        if (customer.confirmedCount === 0 && customer.totalOrders >= 2) riskScore += 15;
        
        // Determine risk level
        let riskLevel = 'low';
        if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'medium';
        
        return {
          ...customer,
          riskScore,
          riskLevel,
          rejectionRate: rejectionRate.toFixed(1),
          noAnswerRate: noAnswerRate.toFixed(1)
        };
      });
      
      // Filter only risky customers
      const riskyCustomers = customerArray.filter(c => c.riskLevel !== 'low');
      setRiskCustomers(riskyCustomers);
      
      // Calculate stats
      setStats({
        highRisk: riskyCustomers.filter(c => c.riskLevel === 'high').length,
        mediumRisk: riskyCustomers.filter(c => c.riskLevel === 'medium').length,
        lowRisk: customerArray.filter(c => c.riskLevel === 'low').length,
        blocked: 0, // Would need separate blocked list
        totalRejected: orders.filter(o => o.status === 'rejected').length,
        totalNoAnswer: orders.filter(o => o.status === 'no_answer').length
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

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'from-red-500/20 to-red-600/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30';
      default:
        return 'from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const columns = [
    {
      accessor: 'name',
      header: 'Customer',
      sortable: true,
      className: 'font-semibold text-white',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRiskColor(row.riskLevel)} flex items-center justify-center text-white font-semibold`}>
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
      accessor: 'riskLevel',
      header: 'Risk Level',
      sortable: true,
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRiskColor(row.riskLevel)} border`}>
          {row.riskLevel.toUpperCase()}
        </span>
      )
    },
    {
      accessor: 'riskScore',
      header: 'Risk Score',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                row.riskScore >= 60 ? 'from-red-500 to-red-600' :
                row.riskScore >= 30 ? 'from-orange-500 to-orange-600' :
                'from-yellow-500 to-yellow-600'
              }`}
              style={{ width: `${Math.min(row.riskScore, 100)}%` }}
            />
          </div>
          <span className="font-medium">{row.riskScore}</span>
        </div>
      )
    },
    {
      accessor: 'totalOrders',
      header: 'Total Orders',
      sortable: true,
      cell: (row) => row.totalOrders
    },
    {
      accessor: 'rejectedCount',
      header: 'Rejected',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{row.rejectedCount}</span>
        </div>
      )
    },
    {
      accessor: 'noAnswerCount',
      header: 'No Answer',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{row.noAnswerCount}</span>
        </div>
      )
    },
    {
      accessor: 'rejectionRate',
      header: 'Rejection Rate',
      sortable: true,
      cell: (row) => `${row.rejectionRate}%`
    },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
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
            title="High Risk Customers"
            value={stats.highRisk}
            type="alert"
            icon={AlertTriangle}
          />
          <KPICard
            title="Medium Risk"
            value={stats.mediumRisk}
            type="pending"
            icon={AlertCircle}
          />
          <KPICard
            title="Total Rejections"
            value={stats.totalRejected}
            type="alert"
            icon={XCircle}
          />
          <KPICard
            title="Total No Answers"
            value={stats.totalNoAnswer}
            type="pending"
            icon={Clock}
          />
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Low Risk Customers"
            value={stats.lowRisk}
            type="confirmed"
            icon={Shield}
          />
          <KPICard
            title="Blocked Customers"
            value={stats.blocked}
            type="alert"
            icon={Ban}
          />
        </div>

        {/* Risk Customers Table */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Risk Analysis
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors">
                High Risk
              </button>
              <button className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors">
                Medium Risk
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={riskCustomers}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No risky customers found"
          />
        </div>

        {/* Risk Guidelines */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#a98be8]" />
            Risk Assessment Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h4 className="font-semibold text-red-400 mb-2">High Risk (60+ points)</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 3+ rejected orders</li>
                <li>• 5+ no answers</li>
                <li>• 50%+ rejection rate</li>
                <li>• No confirmed orders</li>
              </ul>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <h4 className="font-semibold text-orange-400 mb-2">Medium Risk (30-59 points)</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 2 rejected orders</li>
                <li>• 3-4 no answers</li>
                <li>• 30-49% rejection rate</li>
                <li>• Mixed order history</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h4 className="font-semibold text-green-400 mb-2">Low Risk (0-29 points)</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 0-1 rejected orders</li>
                <li>• 0-2 no answers</li>
                <li>• Low rejection rate</li>
                <li>• Good order history</li>
              </ul>
            </div>
          </div>
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
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRiskColor(selectedCustomer.riskLevel)} flex items-center justify-center text-white text-2xl font-bold`}>
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Risk Score */}
              <div className={`bg-gradient-to-r ${getRiskColor(selectedCustomer.riskLevel)} rounded-xl p-6 mb-6 border`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Risk Assessment</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold bg-white/20`}>
                    {selectedCustomer.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Risk Score</span>
                      <span className="text-2xl font-bold">{selectedCustomer.riskScore}/100</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedCustomer.riskScore >= 60 ? 'bg-red-500' :
                          selectedCustomer.riskScore >= 30 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(selectedCustomer.riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{selectedCustomer.totalOrders}</div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-red-400">{selectedCustomer.rejectedCount}</div>
                  <div className="text-sm text-gray-400">Rejected</div>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-400">{selectedCustomer.noAnswerCount}</div>
                  <div className="text-sm text-gray-400">No Answer</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">{selectedCustomer.confirmedCount}</div>
                  <div className="text-sm text-gray-400">Confirmed</div>
                </div>
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
                      <StatusBadge status={order.status} />
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
