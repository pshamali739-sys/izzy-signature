import React from 'react';
import { CheckCircle, Truck, AlertTriangle, ShoppingBag, Clock } from 'lucide-react';

export default function NotificationPanel() {
  const notifications = [
    { 
      id: 1, 
      type: 'success',
      title: 'Order Delivered',
      message: 'Order #ORD-001 delivered successfully',
      time: '2 minutes ago',
      icon: CheckCircle
    },
    { 
      id: 2, 
      type: 'warning',
      title: 'High Risk Customer',
      message: 'New high-risk customer detected',
      time: '15 minutes ago',
      icon: AlertTriangle
    },
    { 
      id: 3, 
      type: 'info',
      title: 'Shipment Update',
      message: 'Shipment status updated for ORD-002',
      time: '1 hour ago',
      icon: Truck
    },
    { 
      id: 4, 
      type: 'success',
      title: 'New Order',
      message: 'New order received from John Doe',
      time: '2 hours ago',
      icon: ShoppingBag
    },
  ];

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-[#94A3B8] bg-white/5';
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/8 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Recent Notifications</h3>
        <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-3 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
                <notification.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                  <Clock className="w-3 h-3 text-[#94A3B8] flex-shrink-0" />
                </div>
                <p className="text-[#94A3B8] text-xs truncate">{notification.message}</p>
                <p className="text-[#94A3B8] text-xs mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
