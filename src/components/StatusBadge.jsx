import React from 'react';
import { cn } from '../lib/utils';

export default function StatusBadge({ status, className }) {
  const config = {
    pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    confirmed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    no_answer: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    packing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ready_for_courier: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sent_to_courier: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    in_transit: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
    out_for_delivery: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    delivered: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    returned: 'bg-red-600/10 text-red-500 border-red-600/20',
    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    
    // Risk Levels
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const styleClass = config[status] || config.pending;

  // Format status for display
  const displayStatus = status.replace(/_/g, ' ');

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize whitespace-nowrap",
      styleClass,
      className
    )}>
      {displayStatus}
    </span>
  );
}
