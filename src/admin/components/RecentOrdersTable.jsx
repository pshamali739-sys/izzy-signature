import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, MoreVertical } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function RecentOrdersTable({ onRowClick }) {
  const token = localStorage.getItem('izzy_admin_token');
  
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => {
      const res = await fetch('/api/orders?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  const orders = ordersResponse?.data || [];

  return (
    <div className="bg-[#111827] rounded-xl border border-white/8 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white/8 flex items-center justify-between">
        <h2 className="text-white font-semibold">Recent Orders</h2>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All Orders
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Order ID</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Courier</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Risk</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {isLoading ? (
              <tr>
                <td colSpan="9" className="px-5 py-8 text-center text-[#94A3B8]">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-5 py-8 text-center text-[#94A3B8]">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onRowClick && onRowClick(order)}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-purple-400 font-medium">{order.order_code}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button 
                      className="text-white font-medium hover:text-purple-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick && onRowClick(order);
                      }}
                    >
                      {order.customer_name}
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#94A3B8]">{order.mobile_number}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#94A3B8]">
                    Rs.{(order.amount || 3500).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#94A3B8]">Trans Express</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Low
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#94A3B8]">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick && onRowClick(order);
                      }}
                      className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
