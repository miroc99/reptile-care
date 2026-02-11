import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Box,
  Calendar, 
  ToggleRight, 
  Bell, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: '儀表板', href: '/dashboard', icon: LayoutDashboard },
    { name: '飼養缸管理', href: '/tanks', icon: Box },
    { name: '排程管理', href: '/schedule', icon: Calendar },
    { name: '手動控制', href: '/control', icon: ToggleRight },
    { name: '告警設定', href: '/alerts', icon: Bell },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <h1 className="text-xl font-bold text-white">爬蟲環控系統</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
