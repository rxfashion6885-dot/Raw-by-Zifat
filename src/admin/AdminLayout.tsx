import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.js';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Settings,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const { isAdmin, adminUser, logout, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white text-xs uppercase tracking-widest font-bold">
        Checking Admin Permissions...
      </div>
    );
  }

  if (!isAdmin) {
    window.location.href = '/admin/login';
    return null;
  }

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { key: 'products', label: 'Products', icon: Package, href: '/admin/products' },
    { key: 'categories', label: 'Categories', icon: Layers, href: '/admin/categories' },
    { key: 'hero-banners', label: 'Hero & Banners', icon: ImageIcon, href: '/admin/hero-banners' },
    { key: 'coupons', label: 'Coupons', icon: Tag, href: '/admin/coupons' },
    { key: 'settings', label: 'Store Settings', icon: Settings, href: '/admin/settings' },
    { key: 'audit-logs', label: 'Audit Logs', icon: History, href: '/admin/audit-logs' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-sm tracking-wider">RAW BY ZIFAT ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-neutral-950 text-white p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-neutral-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Portal Tag */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">SECURE PORTAL</span>
            </div>
            <a href="/admin" className="block text-xl font-black tracking-[0.15em] uppercase text-white font-sans">
              RAW BY ZIFAT
            </a>
            <span className="text-[10px] text-neutral-400 font-semibold">Store Management v1.0</span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-white text-neutral-950 shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Info & Quick Actions */}
        <div className="pt-6 border-t border-neutral-800 space-y-3">
          <div className="text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Signed in as:</span>
            <span className="font-bold text-neutral-200 truncate block">
              {adminUser?.username || 'zifat69'} <span className="text-amber-400 font-medium text-[10px] ml-1">({adminUser?.role || 'SUPER_ADMIN'})</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => logout().then(() => (window.location.href = '/admin/login'))}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
