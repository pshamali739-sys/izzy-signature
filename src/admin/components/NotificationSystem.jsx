import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  X,
  Phone,
  Package,
  DollarSign
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, clearAll, notifications }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'warning':
        return 'border-yellow-500/30';
      case 'info':
      default:
        return 'border-blue-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`bg-[#16182e]/95 backdrop-blur-xl border ${getBorderColor()} rounded-xl p-4 shadow-2xl`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {notification.icon || getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{notification.title}</p>
          {notification.message && (
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

// Simulated real-time notifications hook
export const useRealTimeNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Simulate incoming notifications
    const interval = setInterval(() => {
      const events = [
        {
          type: 'info',
          title: 'New Order Received',
          message: 'Order #IZZ-1234 from John Doe',
          icon: <Package className="w-5 h-5 text-blue-400" />
        },
        {
          type: 'success',
          title: 'COD Collected',
          message: 'Rs.3,500 collected from Order #IZZ-1233',
          icon: <DollarSign className="w-5 h-5 text-green-400" />
        },
        {
          type: 'warning',
          title: 'Missed Call',
          message: 'Customer +94 77 123 4567 not responding',
          icon: <Phone className="w-5 h-5 text-yellow-400" />
        },
        {
          type: 'error',
          title: 'Order Returned',
          message: 'Order #IZZ-1232 returned by courier',
          icon: <XCircle className="w-5 h-5 text-red-400" />
        }
      ];

      // Randomly trigger a notification (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const event = events[Math.floor(Math.random() * events.length)];
        addNotification(event);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);
};
