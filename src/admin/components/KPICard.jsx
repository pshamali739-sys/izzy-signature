import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, trend, trendValue, type }) {
  const getGradientBorder = () => {
    switch (type) {
      case 'total':
        return 'from-purple-600 to-purple-800';
      case 'pending':
        return 'from-blue-600 to-blue-800';
      case 'confirmed':
        return 'from-green-600 to-green-800';
      case 'in_transit':
        return 'from-yellow-600 to-yellow-800';
      case 'delivered':
        return 'from-emerald-600 to-emerald-800';
      case 'returned':
        return 'from-red-600 to-red-800';
      case 'cod':
        return 'from-purple-600 to-pink-800';
      default:
        return 'from-purple-600 to-purple-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'total':
        return 'text-purple-400';
      case 'pending':
        return 'text-blue-400';
      case 'confirmed':
        return 'text-green-400';
      case 'in_transit':
        return 'text-yellow-400';
      case 'delivered':
        return 'text-emerald-400';
      case 'returned':
        return 'text-red-400';
      case 'cod':
        return 'text-purple-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <div className="relative group">
      {/* Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getGradientBorder()} rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
      
      {/* Card Content */}
      <div className="relative bg-[#111827] rounded-xl p-5 border border-white/8 hover:border-white/12 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/5 ${getIconColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          {/* Trend Indicator */}
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-[#94A3B8] text-sm font-medium">{title}</h3>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
