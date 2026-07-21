import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Truck, AlertCircle, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap = {
  success: { icon: CheckCircle, colorClass: 'bg-emerald-500/20 text-emerald-400' },
  info: { icon: Truck, colorClass: 'bg-blue-500/20 text-blue-400' },
  warning: { icon: AlertCircle, colorClass: 'bg-orange-500/20 text-orange-400' },
  new: { icon: Package, colorClass: 'bg-purple-500/20 text-purple-400' },
};

function formatTimeAgo(dateString) {
  const diff = Math.floor((new Date() - new Date(dateString)) / 60000); // in minutes
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function NotificationPanel() {
  const token = localStorage.getItem('izzy_admin_token');

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000 // Polling every 30 seconds for live feel
  });

  return (
    <div className="card-panel p-5 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Recent Notifications</h3>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">Failed to load</div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">No new notifications</div>
        ) : (
          notifications.map((notif) => {
            const config = iconMap[notif.type] || iconMap.info;
            const Icon = config.icon;
            return (
              <div key={notif.id} className="flex gap-3 group cursor-pointer">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", config.colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{notif.title}</p>
                    <span className="text-[10px] text-slate-500 shrink-0">{formatTimeAgo(notif.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{notif.message}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
