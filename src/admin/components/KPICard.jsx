import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  ArrowUp,
  ArrowDown,
  Package, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  MoreVertical
} from 'lucide-react';

const iconMap = {
  total: Package,
  pending: Clock,
  confirmed: CheckCircle,
  in_transit: Truck,
  delivered: CheckCircle,
  returned: RotateCcw,
  cod: DollarSign,
  customers: Users,
};

const colorMap = {
  total: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  pending: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  confirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  in_transit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  delivered: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
  returned: 'bg-red-500/20 text-red-400 border-red-500/20',
  cod: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  customers: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
};

export default function KPICard({ 
  title, 
  value, 
  type = 'total', 
  trend, 
  trendValue, 
  icon: customIcon,
  onClick 
}) {
  const Icon = customIcon || iconMap[type] || Package;
  const colorClass = colorMap[type] || colorMap.total;
  
  const isPositive = trend === 'up';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'card-panel p-5 cursor-pointer transition-all duration-200 group relative overflow-hidden',
        onClick && 'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5'
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center border',
          colorClass
        )}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <button className="text-slate-600 hover:text-slate-400 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      
      {trendValue && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <div className={cn(
            'flex items-center gap-0.5',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
          <span className="text-slate-500 font-normal">vs yesterday</span>
        </div>
      )}
      
      {/* Subtle top border glow for the card itself based on its color */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-[1px] opacity-20 group-hover:opacity-40 transition-opacity",
        colorClass.split(' ')[0].replace('/20', '/50') // Takes the bg color and makes it solid
      )} />
    </motion.div>
  );
}
