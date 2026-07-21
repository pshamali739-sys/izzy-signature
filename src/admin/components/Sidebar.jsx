import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  MapPin, 
  Phone, 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  Bell, 
  Settings,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { 
      icon: Package, 
      label: 'Orders', 
      path: '/admin/orders',
      submenu: [
        { label: 'All Orders', path: '/admin/orders' },
        { label: 'Pending', path: '/admin/orders?status=pending' },
        { label: 'Confirmed', path: '/admin/orders?status=confirmed' },
        { label: 'Packing', path: '/admin/orders?status=packing' },
        { label: 'Ready For Courier', path: '/admin/orders?status=ready_for_courier' },
        { label: 'In Transit', path: '/admin/orders?status=in_transit' },
        { label: 'Delivered', path: '/admin/orders?status=delivered' },
        { label: 'Returned', path: '/admin/orders?status=returned' },
      ]
    },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Truck, label: 'Courier', path: '/admin/courier' },
    { icon: MapPin, label: 'Tracking', path: '/admin/tracking' },
    { icon: Phone, label: 'Call Center', path: '/admin/call-center' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: DollarSign, label: 'COD Management', path: '/admin/cod' },
    { icon: AlertTriangle, label: 'Risk Management', path: '/admin/risk' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-[280px] bg-[#0F172A] border-r border-white/8
        transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">IZZY OMS</h1>
              <p className="text-[#94A3B8] text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => setOrdersOpen(!ordersOpen)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${isActive(item.path) ? 'bg-purple-600/20 text-purple-400' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${ordersOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {ordersOpen && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`
                                block px-4 py-2 rounded-lg text-sm transition-colors duration-200
                                ${location.pathname === subItem.path ? 'bg-purple-600/20 text-purple-400' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}
                              `}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive(item.path) ? 'bg-purple-600/20 text-purple-400' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin User Card */}
        <div className="p-4 border-t border-white/8">
          <div className="bg-[#111827] rounded-lg p-4 border border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">Admin User</p>
                <p className="text-[#94A3B8] text-xs truncate">admin@izzy.com</p>
              </div>
              <button className="text-[#94A3B8] hover:text-white transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
