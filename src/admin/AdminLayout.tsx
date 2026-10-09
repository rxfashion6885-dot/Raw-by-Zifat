import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.js';
import { AdminLoginPage } from './AdminLoginPage.js';
import { api } from '../services/api.js';
import type { Order } from '../types/index.js';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  XCircle,
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
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

// 4K Audio chime synthesizer (Zero external dependencies, crystal clear)
const playOrderChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: E5 (659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: B5 (987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch {
    // browser audio context may be restricted before first click
  }
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const { isAdmin, adminUser, logout, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [confirmedOrdersCount, setConfirmedOrdersCount] = useState(0);
  const [rejectedOrdersCount, setRejectedOrdersCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevPendingCountRef = useRef<number | null>(null);

  // Periodically check orders for real-time notification
  const checkOrders = async () => {
    try {
      const allOrders = await api.adminGetOrders({});
      const pending = allOrders.filter((o) => o.orderStatus === 'pending');
      const confirmed = allOrders.filter((o) => o.orderStatus !== 'pending' && o.orderStatus !== 'cancelled');
      const cancelled = allOrders.filter((o) => o.orderStatus === 'cancelled');

      setPendingOrdersCount(pending.length);
      setConfirmedOrdersCount(confirmed.length);
      setRejectedOrdersCount(cancelled.length);

      // Detect if a brand new order arrived
      if (prevPendingCountRef.current !== null && pending.length > prevPendingCountRef.current) {
        const latestOrder = pending[0];
        setNewOrderAlert(latestOrder);
        if (soundEnabled) {
          playOrderChime();
        }
      }
      prevPendingCountRef.current = pending.length;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    checkOrders();
    const interval = setInterval(checkOrders, 12000); // 12 seconds check
    return () => clearInterval(interval);
  }, [isAdmin, soundEnabled]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white text-xs uppercase tracking-widest font-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginPage />;
  }

  // Get current subview from query
  const searchParams = new URLSearchParams(window.location.search);
  const currentView = searchParams.get('view') || 'new';

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    {
      key: 'orders-new',
      label: '📥 New Orders',
      icon: Inbox,
      href: '/admin/orders?view=new',
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      isOrderSub: true,
      activeIf: activeTab === 'orders' && currentView === 'new',
    },
    {
      key: 'orders-confirmed',
      label: '✅ Confirmed Orders',
      icon: CheckCircle2,
      href: '/admin/orders?view=confirmed',
      badge: confirmedOrdersCount > 0 ? `${confirmedOrdersCount}` : undefined,
      badgeColor: 'bg-emerald-600 text-white',
      isOrderSub: true,
      activeIf: activeTab === 'orders' && currentView === 'confirmed',
    },
    {
      key: 'orders-rejected',
      label: '❌ Rejected Orders',
      icon: XCircle,
      href: '/admin/orders?view=rejected',
      badge: rejectedOrdersCount > 0 ? `${rejectedOrdersCount}` : undefined,
      badgeColor: 'bg-neutral-700 text-neutral-300',
      isOrderSub: true,
      activeIf: activeTab === 'orders' && currentView === 'rejected',
    },
    { key: 'products', label: 'Products', icon: Package, href: '/admin/products' },
    { key: 'categories', label: 'Categories', icon: Layers, href: '/admin/categories' },
    { key: 'hero-banners', label: 'Hero & Banners', icon: ImageIcon, href: '/admin/hero-banners' },
    { key: 'coupons', label: 'Coupons', icon: Tag, href: '/admin/coupons' },
    { key: 'settings', label: 'Store Settings', icon: Settings, href: '/admin/settings' },
    { key: 'audit-logs', label: 'Audit Logs', icon: History, href: '/admin/audit-logs' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row antialiased selection:bg-neutral-900 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-neutral-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-black text-sm tracking-wider uppercase">RAW BY ZIFAT ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          {pendingOrdersCount > 0 && (
            <a
              href="/admin/orders?view=new"
              className="flex items-center gap-1 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg animate-pulse"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingOrdersCount} New</span>
            </a>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-neutral-950 text-white p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-neutral-900 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Brand Logo & Portal Tag */}
          <div className="pb-2 border-b border-neutral-900">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">ADMIN 4K PORTAL</span>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Order sound chime active' : 'Order sound muted'}
                className="text-neutral-500 hover:text-white p-1 rounded-md"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a href="/admin" className="block text-xl font-black tracking-[0.15em] uppercase text-white font-sans">
              RAW BY ZIFAT
            </a>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-neutral-400 font-semibold">Flagship Operations</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded font-bold">
                LIVE
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeIf !== undefined ? item.activeIf : activeTab === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-neutral-950 shadow-lg font-extrabold translate-x-1'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-neutral-800 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Info & Quick Actions */}
        <div className="pt-4 border-t border-neutral-900 space-y-2.5 shrink-0">
          <div className="text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Current Admin</span>
            <span className="font-extrabold text-neutral-200 truncate block">
              {adminUser?.username || 'admin12'}
              <span className="text-amber-400 font-bold text-[10px] ml-1">
                ({adminUser?.role || 'SUPER_ADMIN'})
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-300 transition-colors border border-neutral-800"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => logout().then(() => (window.location.href = '/admin/login'))}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Real-Time Order Received Notification Banner */}
          {newOrderAlert && (
            <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white text-rose-700 px-2 py-0.5 rounded-md">
                      🔔 NOTUN ORDER ASHCHE!
                    </span>
                    <span className="font-mono text-xs font-bold">#{newOrderAlert.id}</span>
                  </div>
                  <p className="text-xs text-white/95 mt-0.5 font-medium">
                    Customer: <strong className="text-white">{newOrderAlert.customerName}</strong> • Phone: {newOrderAlert.phone} • Total: <strong className="text-white font-mono">৳{newOrderAlert.total.toLocaleString()}</strong> ({newOrderAlert.paymentMethod.toUpperCase()})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <a
                  href="/admin/orders?view=new"
                  onClick={() => setNewOrderAlert(null)}
                  className="px-4 py-2 bg-white text-rose-700 font-extrabold rounded-xl text-xs hover:bg-neutral-100 transition-colors shadow-sm"
                >
                  View & Confirm Order
                </a>
                <button
                  type="button"
                  onClick={() => setNewOrderAlert(null)}
                  className="p-2 text-white/80 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
};
