import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import type { AnalyticsStats } from '../types/index.js';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  BarChart3,
  Users,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.adminGetAnalytics();
        setStats(data);
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              REAL-TIME OVERVIEW
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Store Analytics & KPIs
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 bg-white px-3.5 py-2 rounded-xl border border-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Sync</span>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-sm font-semibold text-neutral-400">
            Loading Real-time Metrics...
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Revenue */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-neutral-950">
                  ৳{stats.totalSales.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <span>Today:</span>
                  <strong className="text-neutral-800">৳{stats.todaySales.toLocaleString()}</strong>
                  <span className="text-neutral-300">•</span>
                  <span>7 Days:</span>
                  <strong className="text-neutral-800">৳{stats.weekSales.toLocaleString()}</strong>
                </div>
              </div>

              {/* Gross Profit / Costs */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Profit</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-neutral-950">
                  {stats.totalCost > 0 ? (
                    `৳${stats.totalProfit.toLocaleString()}`
                  ) : (
                    <span className="text-base text-neutral-400 font-bold">Cost Data Unavailable</span>
                  )}
                </div>
                <div className="text-xs text-neutral-500">
                  {stats.totalCost > 0 ? (
                    <span>Total Product Cost: ৳{stats.totalCost.toLocaleString()}</span>
                  ) : (
                    <span>Add product cost price to calculate margin</span>
                  )}
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-neutral-950">
                  {stats.totalOrders}
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-2">
                  <span className="text-amber-600 font-bold">{stats.pendingOrders} Pending</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-emerald-600 font-bold">{stats.completedOrders} Delivered</span>
                </div>
              </div>

              {/* Store Traffic & Conversions */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Views & Actions</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-neutral-950">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <span>Cart Additions:</span>
                  <strong className="text-neutral-900">{stats.totalCartAdds}</strong>
                </div>
              </div>
            </div>

            {/* Performance Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Most Viewed Products */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                    Most Viewed Apparel
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">Ei product koto bar view hoise</span>
                </div>

                <div className="divide-y divide-neutral-100">
                  {stats.mostViewedProducts.map((p) => (
                    <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.thumbnail || p.images[0]}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded-xl bg-neutral-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-950 truncate">{p.name}</h4>
                          <span className="text-[11px] text-neutral-400 font-medium">{p.sku}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-neutral-950">
                          {p.viewsCount || 0} Views
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {p.cartAddCount || 0} In Carts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Selling Products */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                    Best Selling Drops
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">Koita order & revenue</span>
                </div>

                <div className="divide-y divide-neutral-100">
                  {stats.mostOrderedProducts.map((p) => (
                    <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.thumbnail || p.images[0]}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded-xl bg-neutral-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-950 truncate">{p.name}</h4>
                          <span className="text-[11px] text-neutral-400 font-medium">
                            Stock: {p.stockQuantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-emerald-700">
                          ৳{(p.revenue || 0).toLocaleString()}
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {p.unitsSoldCount || 0} Units Sold
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-neutral-400">Latest guest checkout submissions</p>
                </div>
                <a
                  href="/admin/orders"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
                >
                  <span>Manage All Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {stats.recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No orders placed yet. Orders will appear here in real-time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 text-[10px] uppercase font-bold text-neutral-400">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {stats.recentOrders.map((o) => (
                        <tr key={o.id} className="text-neutral-800 hover:bg-neutral-50/50">
                          <td className="py-3 font-mono font-bold text-neutral-950">{o.id}</td>
                          <td className="py-3">
                            <span className="font-bold">{o.customerName}</span>
                            <span className="text-neutral-400 text-[11px] block">{o.phone}</span>
                          </td>
                          <td className="py-3 font-bold text-neutral-950">৳{o.total.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="uppercase text-[11px] font-semibold">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                o.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.orderStatus === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-[11px] text-neutral-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};
