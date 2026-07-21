import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatusBadge from '../../components/StatusBadge';

export default function TopRiskCustomers() {
  const token = localStorage.getItem('izzy_admin_token');

  const { data: topRiskCustomers = [], isLoading, error } = useQuery({
    queryKey: ['customers', 'risk'],
    queryFn: async () => {
      const res = await fetch('/api/customers/risk', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch risk data');
      return res.json();
    }
  });

  return (
    <div className="card-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Top Risk Customers</h3>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-slate-500 text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">Failed to load</div>
        ) : topRiskCustomers.length === 0 ? (
          <div className="text-slate-500 text-center py-4">No high-risk customers found</div>
        ) : (
          topRiskCustomers.map((customer, index) => {
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.customer_name)}&background=334155&color=fff`;
            return (
              <div key={customer.phone || index} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={customer.customer_name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{customer.customer_name}</p>
                    <p className="text-xs text-slate-400">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={customer.risk_level} className="w-24 justify-center" />
                  <span className="text-sm text-slate-300 w-12 text-right">{customer.risk_score}/100</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
