import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function CourierStatusChart() {
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
    { name: 'Processing', value: stats.processing || 0, color: '#7C3AED' },
    { name: 'In Transit', value: stats.in_transit || 0, color: '#F59E0B' },
    { name: 'Out for Delivery', value: stats.out_for_delivery || 0, color: '#3B82F6' },
    { name: 'Delivered', value: stats.delivered || 0, color: '#10B981' },
    { name: 'Returned', value: stats.returned || 0, color: '#EF4444' },
  ].filter(item => item.value > 0) : [];

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/8 h-[350px] flex flex-col">
      <h3 className="text-white font-semibold mb-2">Courier Status Overview</h3>
      <div className="flex-1 min-h-0 flex items-center relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">Loading chart...</div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-400">Failed to load data</div>
        ) : total === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">No active shipments</div>
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
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-[#94A3B8]">Total</span>
                <span className="text-lg font-bold text-white">{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-[55%] flex flex-col justify-center space-y-3.5 pl-4 border-l border-white/8">
              {pieData.map((item, i) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[#94A3B8]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                       <span className="text-white font-medium">{item.value}</span>
                       <span className="text-[#94A3B8] w-8 text-right">({percentage}%)</span>
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
