import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Package, 
  Users, 
  Truck, 
  MapPin,
  PhoneCall,
  FileText,
  DollarSign,
  ShieldAlert,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  Moon,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationProvider, useNotifications, useRealTimeNotifications } from './NotificationSystem';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
  { 
    id: 'orders', 
    label: 'Orders', 
    icon: Package, 
    path: '/admin/orders',
    subItems: [
      { id: 'all', label: 'All Orders', status: '' },
      { id: 'pending', label: 'Pending', status: 'pending' },
      { id: 'confirmed', label: 'Confirmed', status: 'confirmed' },
      { id: 'packing', label: 'Packing', status: 'packing' },
      { id: 'ready', label: 'Ready For Courier', status: 'ready_for_courier' },
      { id: 'transit', label: 'In Transit', status: 'in_transit' },
      { id: 'delivered', label: 'Delivered', status: 'delivered' },
      { id: 'returned', label: 'Returned', status: 'returned' },
    ]
  },
  { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
  { id: 'courier', label: 'Courier', icon: Truck, path: '/admin/courier' },
  { id: 'tracking', label: 'Tracking', icon: MapPin, path: '/admin/tracking' },
  { id: 'call_center', label: 'Call Center', icon: PhoneCall, path: '/admin/call-center' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
  { id: 'cod_management', label: 'COD Management', icon: DollarSign, path: '/admin/analytics' },
  { id: 'risk', label: 'Risk Management', icon: ShieldAlert, path: '/admin/risk' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications', badge: 8 },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayoutContent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(true);
  
  const { notifications } = useNotifications();
  useRealTimeNotifications();

  const token = localStorage.getItem('izzy_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleOrderClick = (status) => {
    navigate(`/admin/orders${status ? `?status=${status}` : ''}`);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200 font-sans flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileSidebarOpen ? 0 : '-100%'
        }}
        className={cn(
          'fixed left-0 top-0 h-full w-[260px] bg-[#121420] border-r border-white/5 z-50 flex flex-col',
          'lg:translate-x-0 lg:static'
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold leading-tight">IZZY OMS</h2>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isOrders = item.id === 'orders';
            
            return (
              <div key={item.id} className="mb-1">
                <button
                  onClick={() => {
                    if (isOrders) {
                      setOrdersOpen(!ordersOpen);
                    } else {
                      navigate(item.path);
                      setMobileSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm',
                    active && !isOrders
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", active && !isOrders ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300')} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {isOrders && (
                    <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-500", ordersOpen ? "rotate-180" : "")} />
                  )}
                  {item.badge && (
                    <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </div>
                  )}
                </button>

                {/* Sub-menu for Orders */}
                {isOrders && (
                  <AnimatePresence>
                    {ordersOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-10 pr-3 py-1 space-y-1">
                          {item.subItems.map(sub => {
                            // Extract search param to determine active state
                            const searchParams = new URLSearchParams(location.search);
                            const currentStatus = searchParams.get('status') || '';
                            const subActive = location.pathname === '/admin/orders' && currentStatus === sub.status;
                            
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleOrderClick(sub.status)}
                                className={cn(
                                  "w-full text-left text-sm py-2 px-2 rounded-lg transition-colors",
                                  subActive ? "text-purple-400" : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}
                              >
                                {sub.label}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-white/5 mx-2 mb-2">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
               <img src={`https://ui-avatars.com/api/?name=Admin+User&background=6b21a8&color=fff`} alt="Admin" className="rounded-full w-full h-full object-cover"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-[11px] text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0f111a] border-b border-white/5 shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search orders, customers, phone number..."
                className="w-full bg-[#161825] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="relative p-2 text-slate-400 hover:text-white transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#0f111a]"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition">
              <Moon className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0">
                 <img src={`https://ui-avatars.com/api/?name=Admin+User&background=6b21a8&color=fff`} alt="Admin" className="rounded-full w-full h-full object-cover"/>
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">Admin User</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-none">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default function AdminLayout({ children }) {
  return (
    <NotificationProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NotificationProvider>
  );
}
