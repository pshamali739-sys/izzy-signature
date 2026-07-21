import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  DollarSign,
  RotateCcw
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import OrdersOverviewChart from './components/OrdersOverviewChart';
import CourierStatusChart from './components/CourierStatusChart';
import NotificationPanel from './components/NotificationPanel';
import RecentOrdersTable from './components/RecentOrdersTable';
import TopRiskCustomers from './components/TopRiskCustomers';
import CustomerDetailsModal from './components/CustomerDetailsModal';

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const token = localStorage.getItem('izzy_admin_token');

  if (!token) {
    navigate('/admin/login');
  }

  // Fetch KPI Stats
  const { data: stats = {
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    readyForCourier: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0,
    totalRevenue: 0,
    todayRevenue: 0
  }, isLoading: loadingStats } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    }
  });

  // Fetch Recent Orders
  const { data: ordersResponse, isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (statusFilter) qs.append('status', statusFilter);
      qs.append('limit', '10');
      
      const res = await fetch(`/api/orders?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  const orders = ordersResponse?.data || [];
  const loading = loadingStats || loadingOrders;

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
        refetchOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-[#94A3B8]">Welcome back, Admin! Here's what's happening today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          <KPICard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            type="total"
            icon={Package}
            trend="up"
            trendValue="12.5%"
          />
          <KPICard
            title="Pending Orders"
            value={stats.pendingOrders.toLocaleString()}
            type="pending"
            icon={Clock}
            trend="up"
            trendValue="8.2%"
          />
          <KPICard
            title="Confirmed"
            value={stats.confirmedOrders.toLocaleString()}
            type="confirmed"
            icon={CheckCircle}
            trend="up"
            trendValue="15.3%"
          />
          <KPICard
            title="In Transit"
            value={stats.inTransit.toLocaleString()}
            type="in_transit"
            icon={Truck}
            trend="up"
            trendValue="10.7%"
          />
          <KPICard
            title="Delivered"
            value={stats.delivered.toLocaleString()}
            type="delivered"
            icon={CheckCircle}
            trend="up"
            trendValue="18.6%"
          />
          <KPICard
            title="Returned"
            value={stats.returned.toLocaleString()}
            type="returned"
            icon={RotateCcw}
            trend="down"
            trendValue="5.1%"
          />
          <KPICard
            title="Today's COD"
            value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
            type="cod"
            icon={DollarSign}
            trend="up"
            trendValue="20.5%"
          />
        </div>

        {/* Charts & Notifications Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 xl:col-span-5">
            <OrdersOverviewChart />
          </div>
          <div className="lg:col-span-3 xl:col-span-4">
             <CourierStatusChart />
          </div>
          <div className="lg:col-span-3 xl:col-span-3">
             <NotificationPanel />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
          {/* Orders Table */}
          <div className="lg:col-span-8">
            <RecentOrdersTable onRowClick={handleRowClick} />
          </div>
          
          {/* Top Risk Customers */}
          <div className="lg:col-span-4">
            <TopRiskCustomers />
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedOrder && (
        <CustomerDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </AdminLayout>
  );
}
