import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1c29] border border-white/10 p-3 rounded-lg shadow-xl text-sm z-50">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 capitalize">{entry.name}</span>
            </div>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function OrdersOverviewChart() {
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
    <div className="card-panel p-5 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Orders Overview</h3>
        <select className="bg-[#121420] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50">
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500">Loading chart...</div>
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
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#a855f7', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="returned" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
          <span className="text-xs text-slate-400">Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-slate-400">Delivered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="text-xs text-slate-400">Returned</span>
        </div>
      </div>
    </div>
  );
}

export function CourierStatusChart() {
  const token = localStorage.getItem('izzy_admin_token');
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['analytics', 'courier-status'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/courier-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const pieData = stats ? [
    { name: 'Processing', value: stats.processing || 0, color: '#a855f7' },
    { name: 'In Transit', value: stats.in_transit || 0, color: '#f59e0b' },
    { name: 'Out for Delivery', value: stats.out_for_delivery || 0, color: '#3b82f6' },
    { name: 'Delivered', value: stats.delivered || 0, color: '#22c55e' },
    { name: 'Returned', value: stats.returned || 0, color: '#ef4444' },
  ].filter(item => item.value > 0) : [];

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="card-panel p-5 h-[350px] flex flex-col">
      <h3 className="text-white font-semibold mb-2">Courier Status Overview</h3>
      <div className="flex-1 min-h-0 flex items-center relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500">Loading chart...</div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-400">Failed to load data</div>
        ) : total === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500">No active shipments</div>
        ) : (
          <>
            <div className="w-[45%] h-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1c29', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400">Total</span>
                <span className="text-lg font-bold text-white">{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-[55%] flex flex-col justify-center space-y-3.5 pl-4 border-l border-white/5">
              {pieData.map((item, i) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                       <span className="text-white font-medium">{item.value}</span>
                       <span className="text-slate-500 w-8 text-right">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
