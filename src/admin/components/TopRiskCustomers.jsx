import React from 'react';
import { AlertTriangle, Phone, Mail } from 'lucide-react';

export default function TopRiskCustomers() {
  const riskCustomers = [
    { 
      id: 1, 
      name: 'John Doe', 
      phone: '0771234567', 
      email: 'john@example.com',
      riskScore: 85,
      riskLevel: 'High Risk',
      returnCount: 3,
      rejectCount: 2
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      phone: '0779876543', 
      email: 'jane@example.com',
      riskScore: 72,
      riskLevel: 'High Risk',
      returnCount: 2,
      rejectCount: 1
    },
    { 
      id: 3, 
      name: 'Bob Johnson', 
      phone: '0775555555', 
      email: 'bob@example.com',
      riskScore: 58,
      riskLevel: 'Medium Risk',
      returnCount: 1,
      rejectCount: 1
    },
  ];

  const getRiskColor = (score) => {
    if (score >= 61) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score >= 31) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'High Risk': return 'bg-red-500/20 text-red-400';
      case 'Medium Risk': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/8 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Top Risk Customers</h3>
        <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {riskCustomers.map((customer) => (
          <div key={customer.id} className="p-4 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">{customer.name.charAt(0)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-white font-medium truncate">{customer.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(customer.riskLevel)}`}>
                    {customer.riskLevel}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-[#94A3B8]">Score: {customer.riskScore}</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Returns: {customer.returnCount}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Rejects: {customer.rejectCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
