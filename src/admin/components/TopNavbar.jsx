import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, User, LogOut } from 'lucide-react';

export default function TopNavbar({ onMenuClick }) {
  const [darkMode, setDarkMode] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, message: 'Order #ORD-001 delivered successfully', time: '2 minutes ago', type: 'success' },
    { id: 2, message: 'New high-risk customer detected', time: '15 minutes ago', type: 'warning' },
    { id: 3, message: 'Shipment status updated for ORD-002', time: '1 hour ago', type: 'info' },
    { id: 4, message: 'New order received from John Doe', time: '2 hours ago', type: 'success' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B1220]/80 backdrop-blur-xl border-b border-white/8">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu Button & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search orders, customers, phone number..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-white/8 rounded-lg text-white placeholder-[#94A3B8] focus:outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/50 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <Moon className="w-5 h-5 text-[#94A3B8]" />
            ) : (
              <Sun className="w-5 h-5 text-[#94A3B8]" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-[#94A3B8]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/8 rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/8">
                  <h3 className="text-white font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-white/8 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{notification.message}</p>
                          <p className="text-[#94A3B8] text-xs mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/8">
                  <button className="w-full text-center text-purple-400 text-sm hover:text-purple-300 transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">Admin User</p>
                <p className="text-[#94A3B8] text-xs">Super Admin</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-white/8 rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                      <span className="text-white font-medium">A</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Admin User</p>
                      <p className="text-[#94A3B8] text-xs">admin@izzy.com</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#94A3B8] hover:bg-white/5 hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#94A3B8] hover:bg-white/5 hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
