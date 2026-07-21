import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from './components/AdminLayout';
import KPICard from './components/KPICard';
import DataTable from './components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { OrdersOverviewChart, CourierStatusChart } from './components/Charts';
import NotificationPanel from './components/NotificationPanel';
import TopRiskCustomers from './components/TopRiskCustomers';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  DollarSign,
  Phone,
  Eye,
  RotateCcw
} from 'lucide-react';

export default function NewDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Fetch Recent Orders (limit to small number or rely on DataTable pagination)
  const { data: ordersResponse, isLoading: loadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (statusFilter) qs.append('status', statusFilter);
      qs.append('limit', '10'); // Just get 10 for dashboard
      
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
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const columns = [
    {
      accessor: 'order_code',
      header: 'Order ID',
      sortable: true,
      className: 'font-medium text-slate-300',
      cell: (row) => row.order_code
    },
    {
      accessor: 'customer_name',
      header: 'Customer',
      sortable: true,
      cell: (row) => <span className="font-medium text-white">{row.customer_name}</span>
    },
    {
      accessor: 'mobile_number',
      header: 'Phone',
      cell: (row) => <span className="text-slate-400">{row.mobile_number}</span>
    },
    {
      accessor: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => <span className="text-slate-300">Rs. {(row.amount || 3500).toLocaleString()}</span>
    },
    {
      accessor: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      accessor: 'courier',
      header: 'Courier',
      cell: (row) => <span className="text-slate-400">Trans Express</span> // Hardcoded for mockup consistency if not in DB
    },
    {
      accessor: 'risk',
      header: 'Risk',
      cell: (row) => <StatusBadge status={row.risk_level || 'Low'} /> // Assuming low if missing
    },
    {
      accessor: 'created_at',
      header: 'Date',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-slate-300">{new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-[10px] text-slate-500">{new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      accessor: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(row);
            }}
            className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
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
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, Admin! Here's what's happening today.</p>
        </div>

        {/* KPI Cards Row */}
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
          <div className="lg:col-span-8 card-panel overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold">Recent Orders</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View All
              </button>
            </div>
            <div className="flex-1 overflow-x-auto">
               <div className="p-5 pt-0">
                  <DataTable
                    columns={columns}
                    data={orders.slice(0, 10)} // limit to recent 10 for dashboard
                    loading={loading}
                    onRowClick={handleRowClick}
                    emptyMessage="No orders found"
                  />
               </div>
            </div>
          </div>

          {/* Top Risk Customers */}
          <div className="lg:col-span-4">
             <TopRiskCustomers />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
