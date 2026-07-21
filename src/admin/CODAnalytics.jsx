import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function CODAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalCOD: 0,
    collectedCOD: 0,
    pendingCOD: 0,
    returnedCOD: 0,
    collectionRate: 0,
    averageCOD: 0,
    dailyData: [],
    weeklyData: [],
    monthlyData: []
  });

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [token, timeRange]);

  const fetchAnalytics = async () => {
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
      
      // Calculate COD analytics
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const pendingOrders = orders.filter(o => 
        ['pending', 'confirmed', 'ready_for_courier', 'sent_to_courier', 'in_transit'].includes(o.status)
      );
      const returnedOrders = orders.filter(o => o.status === 'returned');
      
      const totalCOD = orders.reduce((sum, o) => sum + (o.amount || 3500), 0);
      const collectedCOD = deliveredOrders.reduce((sum, o) => sum + (o.amount || 3500), 0);
      const pendingCOD = pendingOrders.reduce((sum, o) => sum + (o.amount || 3500), 0);
      const returnedCOD = returnedOrders.reduce((sum, o) => sum + (o.amount || 3500), 0);
      
      const collectionRate = totalCOD > 0 ? ((collectedCOD / totalCOD) * 100).toFixed(1) : 0;
      const averageCOD = orders.length > 0 ? (totalCOD / orders.length).toFixed(0) : 0;
      
      // Generate daily data for the last 7 days
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === dateStr);
        const dayCOD = dayOrders.reduce((sum, o) => sum + (o.amount || 3500), 0);
        const dayCollected = dayOrders.filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (o.amount || 3500), 0);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
          total: dayCOD,
          collected: dayCollected,
          pending: dayCOD - dayCollected
        });
      }
      
      setAnalytics({
        totalCOD,
        collectedCOD,
        pendingCOD,
        returnedCOD,
        collectionRate,
        averageCOD,
        dailyData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs.${value.toLocaleString()}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">COD Analytics</h1>
            <p className="text-gray-400">Track cash on delivery performance and trends</p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-[#0a0b16] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a98be8]/50"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total COD Value"
            value={formatCurrency(analytics.totalCOD)}
            type="cod"
            icon={DollarSign}
            trend="up"
            trendValue="+12%"
          />
          <KPICard
            title="Collected COD"
            value={formatCurrency(analytics.collectedCOD)}
            type="confirmed"
            icon={CheckCircle}
            trend="up"
            trendValue="+8%"
          />
          <KPICard
            title="Pending COD"
            value={formatCurrency(analytics.pendingCOD)}
            type="pending"
            icon={Clock}
          />
          <KPICard
            title="Returned COD"
            value={formatCurrency(analytics.returnedCOD)}
            type="alert"
            icon={XCircle}
            trend="down"
            trendValue="-5%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPICard
            title="Collection Rate"
            value={`${analytics.collectionRate}%`}
            type="confirmed"
            icon={TrendingUp}
            trend="up"
            trendValue="+3%"
          />
          <KPICard
            title="Average COD"
            value={formatCurrency(analytics.averageCOD)}
            type="total"
            icon={BarChart3}
          />
        </div>

        {/* Daily COD Chart */}
        <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Daily COD Performance</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a98be8]" />
                <span className="text-gray-400">Total COD</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-400">Pending</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.dailyData.map((day, index) => {
              const maxValue = Math.max(...analytics.dailyData.map(d => d.total));
              const totalHeight = (day.total / maxValue) * 100;
              const collectedHeight = (day.collected / maxValue) * 100;
              
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{day.date}</span>
                    <div className="flex gap-4">
                      <span className="text-white font-medium">{formatCurrency(day.total)}</span>
                      <span className="text-green-400">{formatCurrency(day.collected)}</span>
                      <span className="text-yellow-400">{formatCurrency(day.pending)}</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="absolute top-0 left-0 h-full bg-[#a98be8]/30 rounded-lg"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${collectedHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-lg"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* COD Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collection Breakdown */}
          <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Collection Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-gray-300">Collected</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(analytics.collectedCOD)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span className="text-gray-300">Pending</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(analytics.pendingCOD)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-gray-300">Returned</span>
                </div>
                <span className="text-white font-semibold">{formatCurrency(analytics.returnedCOD)}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-white font-bold text-lg">{formatCurrency(analytics.totalCOD)}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-[#16182e]/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Collection Rate</span>
                  <div className="flex items-center gap-1 text-green-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">+3%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{analytics.collectionRate}%</div>
                <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${analytics.collectionRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Average Order Value</span>
                  <div className="flex items-center gap-1 text-[#e5b962]">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">+5%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{formatCurrency(analytics.averageCOD)}</div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Return Rate</span>
                  <div className="flex items-center gap-1 text-green-400">
                    <ArrowDownRight className="w-4 h-4" />
                    <span className="text-sm">-2%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {analytics.totalCOD > 0 ? ((analytics.returnedCOD / analytics.totalCOD) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#a98be8]/20 to-[#e5b962]/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#e5b962]" />
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Best Collection Day</div>
              <div className="text-lg font-semibold text-white">
                {analytics.dailyData.length > 0 ? 
                  analytics.dailyData.reduce((max, day) => 
                    day.collected > max.collected ? day : max, analytics.dailyData[0]
                  ).date : 'N/A'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Highest COD Day</div>
              <div className="text-lg font-semibold text-white">
                {analytics.dailyData.length > 0 ? 
                  analytics.dailyData.reduce((max, day) => 
                    day.total > max.total ? day : max, analytics.dailyData[0]
                  ).date : 'N/A'}
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Collection Trend</div>
              <div className="text-lg font-semibold text-green-400">Improving</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
