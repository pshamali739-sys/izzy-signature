import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-white/8 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#94A3B8] capitalize">{entry.name}</span>
            </div>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function OrdersOverviewChart() {
  const token = localStorage.getItem('izzy_admin_token');
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['analytics', 'orders-overview'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/orders-overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/8 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Orders Overview</h3>
        <select className="bg-[#0B1220] border border-white/8 rounded-lg px-3 py-1.5 text-sm text-[#94A3B8] focus:outline-none focus:border-purple-600/50">
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">Loading chart...</div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-400">Failed to load data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124, 58, 237, 0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="orders" stroke="#7C3AED" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#7C3AED', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="returned" stroke="#EF4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          <span className="text-xs text-[#94A3B8]">Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-xs text-[#94A3B8]">Delivered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span className="text-xs text-[#94A3B8]">Returned</span>
        </div>
      </div>
    </div>
  );
}
