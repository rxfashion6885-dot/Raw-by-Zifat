import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { Order, OrderStatus, PaymentStatus } from '../types/index.js';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Eye,
  Truck,
  PhoneCall,
  X,
  Inbox,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  RefreshCw,
  Bell,
  Sparkles,
  Package,
} from 'lucide-react';

type OrderViewTab = 'new' | 'confirmed' | 'rejected' | 'all';

export const AdminOrders: React.FC = () => {
  const { showToast } = useStore();

  // Read view from URL query param (?view=new | confirmed | rejected | all)
  const searchParams = new URLSearchParams(window.location.search);
  const initialView = (searchParams.get('view') as OrderViewTab) || 'new';

  const [activeTab, setActiveTab] = useState<OrderViewTab>(initialView);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Tracking details modal / edit state
  const [trackingCourier, setTrackingCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Sync tab with URL
  const switchTab = (tab: OrderViewTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('view', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetOrders({
        search: searchQuery,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
      });
      setOrders(data);
    } catch {
      showToast('Failed to fetch order records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // 1. Confirm Order Action: Moves order immediately to "Confirmed Orders" page!
  const handleConfirmOrder = async (orderId: string) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { orderStatus: 'confirmed' });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`✓ Order ${orderId} confirmed! Moved to Confirmed Orders page.`, 'success');
    } catch {
      showToast('Failed to confirm order', 'error');
    }
  };

  // 2. Reject Order Action: Moves order immediately to "Rejected Orders" page!
  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt(`Enter rejection reason for order ${orderId} (Stock will be restored):`, 'Customer uncontactable or requested cancellation');
    if (reason === null) return; // User pressed Cancel

    try {
      const updated = await api.adminUpdateOrder(orderId, {
        orderStatus: 'cancelled',
        adminNotes: reason ? `Rejected: ${reason}` : 'Cancelled by admin',
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`✕ Order ${orderId} rejected! Moved to Rejected Orders page.`, 'info');
    } catch {
      showToast('Failed to reject order', 'error');
    }
  };

  // 3. Restore Order Action: Moves rejected order back to "New Orders" (pending)
  const handleRestoreOrder = async (orderId: string) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { orderStatus: 'pending' });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order ${orderId} restored! Moved back to New Orders page.`, 'success');
    } catch {
      showToast('Failed to restore order', 'error');
    }
  };

  // 4. Update status along the fulfillment journey
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  // 5. Verify payment
  const handleVerifyPayment = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { paymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Payment marked as ${paymentStatus.toUpperCase()}`, 'success');
    } catch {
      showToast('Failed to update payment status', 'error');
    }
  };

  // Categorize orders for distinct tabs as requested
  const newOrders = orders.filter((o) => o.orderStatus === 'pending');
  const confirmedOrders = orders.filter(
    (o) => o.orderStatus !== 'pending' && o.orderStatus !== 'cancelled'
  );
  const rejectedOrders = orders.filter((o) => o.orderStatus === 'cancelled');

  // Filter orders based on active tab
  const displayedOrders =
    activeTab === 'new'
      ? newOrders
      : activeTab === 'confirmed'
      ? confirmedOrders
      : activeTab === 'rejected'
      ? rejectedOrders
      : orders;

  return (
    <AdminLayout activeTab="orders">
      <div className="space-y-6">
        
        {/* Top Header with 4K Ultra Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                FULFILLMENT & ORDER PIPELINE
              </span>
              <span className="px-2 py-0.5 bg-neutral-900 text-white rounded-md text-[9px] font-mono font-bold">
                4K RESOLUTION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight mt-0.5">
              {activeTab === 'new' && '📥 New Orders (নতুন অর্ডার)'}
              {activeTab === 'confirmed' && '✅ Confirmed Orders (নিশ্চিত অর্ডার)'}
              {activeTab === 'rejected' && '❌ Rejected Orders (বাতিলকৃত অর্ডার)'}
              {activeTab === 'all' && '📋 All Orders Database'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              {activeTab === 'new' && 'Incoming orders waiting for confirmation. Confirm to send to Confirmed page, or reject.'}
              {activeTab === 'confirmed' && 'Orders approved for processing, packing, shipping, and delivery.'}
              {activeTab === 'rejected' && 'Cancelled and rejected orders. Stock has been restored.'}
              {activeTab === 'all' && 'Complete store ordering history with search and payment filters.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-900 rounded-2xl text-xs font-bold border border-neutral-300/70 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Dedicated Tabs: New Orders, Confirmed Orders, Rejected Orders, All Orders */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Tab 1: New Orders */}
          <button
            type="button"
            onClick={() => switchTab('new')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'new'
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl ring-2 ring-rose-500/50'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-rose-500" />
                <span>New Orders</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                newOrders.length > 0
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-neutral-200 text-neutral-700'
              }`}>
                {newOrders.length}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-2 font-medium">Pending confirmation</p>
          </button>

          {/* Tab 2: Confirmed Orders */}
          <button
            type="button"
            onClick={() => switchTab('confirmed')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'confirmed'
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl ring-2 ring-emerald-500/50'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirmed Orders</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                {confirmedOrders.length}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-2 font-medium">In processing & shipping</p>
          </button>

          {/* Tab 3: Rejected Orders */}
          <button
            type="button"
            onClick={() => switchTab('rejected')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'rejected'
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl ring-2 ring-neutral-500/50'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Rejected Orders</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-700 text-neutral-200">
                {rejectedOrders.length}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-2 font-medium">Cancelled / rejected</p>
          </button>

          {/* Tab 4: All Orders */}
          <button
            type="button"
            onClick={() => switchTab('all')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'all'
                ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl'
                : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-neutral-400" />
                <span>All Orders</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-200 text-neutral-800">
                {orders.length}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-2 font-medium">All order archives</p>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, mobile number, customer name, transaction TrxID..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-black"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </form>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-800 focus:outline-hidden"
            >
              <option value="all">All Payment Methods</option>
              <option value="pending">Payment Pending</option>
              <option value="verified">Payment Verified</option>
              <option value="rejected">Payment Rejected</option>
              <option value="cod_pending">COD Pending</option>
            </select>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-3" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Loading Order Pipeline...
              </span>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="py-24 text-center px-4">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-400">
                {activeTab === 'new' ? (
                  <Inbox className="w-7 h-7 text-neutral-400" />
                ) : activeTab === 'confirmed' ? (
                  <CheckCircle2 className="w-7 h-7 text-neutral-400" />
                ) : (
                  <Package className="w-7 h-7 text-neutral-400" />
                )}
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                {activeTab === 'new' && 'No Pending New Orders!'}
                {activeTab === 'confirmed' && 'No Confirmed Orders Found'}
                {activeTab === 'rejected' && 'No Rejected Orders'}
                {activeTab === 'all' && 'No Orders Found'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                {activeTab === 'new' && 'All orders have been reviewed. When a customer places an order, it will appear here immediately with sound notification!'}
                {activeTab === 'confirmed' && 'Confirm pending orders in the New Orders tab to start packaging and fulfillment.'}
                {activeTab === 'rejected' && 'No orders are currently in the cancelled/rejected archive.'}
                {activeTab === 'all' && 'No orders match your search parameters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] uppercase font-black text-neutral-500 tracking-wider">
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-5">Customer & Destination</th>
                    <th className="py-4 px-5">Items Summary</th>
                    <th className="py-4 px-5">Total Amount</th>
                    <th className="py-4 px-5">Payment Method</th>
                    <th className="py-4 px-5">Current Status</th>
                    <th className="py-4 px-5 text-right">Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {displayedOrders.map((o) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        o.orderStatus === 'pending' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Order ID & Time */}
                      <td className="py-4 px-5 align-top">
                        <div className="font-mono font-black text-neutral-950 text-sm flex items-center gap-1.5">
                          {o.orderStatus === 'pending' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                          )}
                          <span>{o.id}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {new Date(o.createdAt).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </td>

                      {/* Customer Details & Contact shortcuts */}
                      <td className="py-4 px-5 align-top">
                        <span className="font-bold text-neutral-900 block text-xs">{o.customerName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${o.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-neutral-800 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors"
                            title="Call customer directly"
                          >
                            <PhoneCall className="w-3 h-3 text-emerald-600" />
                            <span>{o.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/88${o.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-neutral-500 text-[11px] block mt-1 line-clamp-1 max-w-xs">
                          {o.address}, {o.area ? `${o.area}, ` : ''}{o.district}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-5 align-top">
                        <span className="font-bold text-neutral-900 block">
                          {o.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                        </span>
                        <div className="space-y-0.5 mt-0.5 max-w-xs">
                          {o.items.slice(0, 2).map((it, idx) => (
                            <span key={idx} className="text-[11px] text-neutral-600 block truncate">
                              • {it.productName} ({it.size}) × {it.quantity}
                            </span>
                          ))}
                          {o.items.length > 2 && (
                            <span className="text-[10px] text-neutral-400 font-bold block">
                              +{o.items.length - 2} more items
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 align-top font-mono">
                        <span className="font-black text-neutral-950 text-sm block">
                          ৳{o.total.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          Delivery: ৳{o.deliveryCharge}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-5 align-top">
                        <span className="font-black uppercase text-[11px] block text-neutral-900">
                          {o.paymentMethod}
                        </span>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            o.paymentStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.paymentStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        {o.paymentDetails?.transactionId && (
                          <span className="block font-mono text-[10px] text-pink-700 font-bold mt-0.5">
                            Trx: {o.paymentDetails.transactionId}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            o.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : o.orderStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : o.orderStatus === 'confirmed'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : o.orderStatus === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-neutral-900 text-white'
                          }`}
                        >
                          {o.orderStatus === 'pending' && <Clock className="w-3 h-3 text-amber-700" />}
                          {o.orderStatus === 'confirmed' && <CheckCircle2 className="w-3 h-3 text-blue-700" />}
                          {o.orderStatus === 'cancelled' && <XCircle className="w-3 h-3 text-rose-700" />}
                          <span>{o.orderStatus}</span>
                        </span>
                      </td>

                      {/* Actions according to specific tab requirements */}
                      <td className="py-4 px-5 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* NEW ORDERS: Fast 1-Click Confirm & Reject */}
                          {o.orderStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleConfirmOrder(o.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-1 active:scale-95"
                                title="Confirm this order and move it to Confirmed page"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectOrder(o.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1 active:scale-95"
                                title="Reject this order and move to Rejected page"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* REJECTED ORDERS: Option to Restore */}
                          {o.orderStatus === 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleRestoreOrder(o.id)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1"
                              title="Restore order back to New Orders"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}

                          {/* CONFIRMED ORDERS: Quick Print Invoice & Stepper */}
                          {o.orderStatus !== 'pending' && o.orderStatus !== 'cancelled' && (
                            <a
                              href={`/receipt/${o.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="p-2 text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider">
                  ORDER RECORD DETAILS
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-black font-mono text-neutral-950">
                    {selectedOrder.id}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      selectedOrder.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.orderStatus === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedOrder.orderStatus === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-neutral-900 text-white'
                    }`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QUICK ACTIONS BANNER INSIDE MODAL */}
            {selectedOrder.orderStatus === 'pending' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                    ⚠️ New Order Awaiting Action
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Confirm to move to Confirmed Orders page, or reject if customer cancelled.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleConfirmOrder(selectedOrder.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    ✓ Confirm Order
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    className="px-3 py-2 bg-rose-100 text-rose-800 hover:bg-rose-200 font-bold text-xs rounded-xl transition-all"
                  >
                    ✕ Reject Order
                  </button>
                </div>
              </div>
            ) : selectedOrder.orderStatus === 'cancelled' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-rose-950 uppercase">
                    ❌ Order Cancelled / Rejected
                  </span>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    {selectedOrder.adminNotes || 'Stock has been restored automatically.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreOrder(selectedOrder.id)}
                  className="px-3 py-1.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-all"
                >
                  Restore to New Orders
                </button>
              </div>
            ) : null}

            {/* Recipient info & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Customer Information
                </span>
                <p className="font-bold text-sm text-neutral-950">{selectedOrder.customerName}</p>
                
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl font-bold text-xs hover:border-black transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedOrder.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/88${selectedOrder.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-200 transition-colors"
                    title="Open WhatsApp chat with customer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>

                {selectedOrder.alternativePhone && (
                  <p className="text-neutral-500 text-[11px]">Alt: {selectedOrder.alternativePhone}</p>
                )}
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Delivery Destination
                </span>
                <p className="font-semibold text-neutral-900 text-xs">{selectedOrder.address}</p>
                <p className="text-neutral-500 text-xs">
                  {selectedOrder.area ? `${selectedOrder.area}, ` : ''}{selectedOrder.district}
                </p>
                {selectedOrder.deliveryNote && (
                  <p className="text-neutral-700 italic text-[11px] pt-1">
                    Special note: "{selectedOrder.deliveryNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Manual bKash / Nagad Payment Verification Details */}
            {selectedOrder.paymentMethod !== 'cod' && selectedOrder.paymentDetails && (
              <div className="p-4 bg-pink-50/70 border border-pink-200 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center justify-between font-bold text-pink-900">
                  <span className="uppercase tracking-wider">{selectedOrder.paymentMethod} Payment Verification</span>
                  <span className="font-mono font-black text-sm">৳{selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-neutral-700">
                  <div className="p-2.5 bg-white/80 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-neutral-400 block font-bold">Sender Mobile Number</span>
                    <span className="font-mono font-bold text-sm text-neutral-900">
                      {selectedOrder.paymentDetails.senderPhone || selectedOrder.phone}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-neutral-400 block font-bold">Transaction ID (TrxID)</span>
                    <span className="font-mono font-black text-sm text-pink-700">
                      {selectedOrder.paymentDetails.transactionId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'verified')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-colors shadow-xs"
                  >
                    ✓ Approve Payment Verified
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'rejected')}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
                  >
                    ✕ Reject Payment
                  </button>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Ordered Products
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                        />
                      )}
                      <div>
                        <span className="font-bold text-neutral-900">{it.productName}</span>
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-950">৳{it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 flex justify-between text-xs font-bold text-neutral-900 px-1 border-t border-neutral-100 mt-2">
                <span>Grand Total (Delivery included)</span>
                <span className="text-base font-black font-mono">৳{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Advance Status Controls for Confirmed Orders */}
            {selectedOrder.orderStatus !== 'cancelled' && (
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Update Fulfillment Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'pending',
                      'confirmed',
                      'processing',
                      'packed',
                      'shipped',
                      'out_for_delivery',
                      'delivered',
                    ] as OrderStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
                        selectedOrder.orderStatus === st
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
              {selectedOrder.orderStatus !== 'cancelled' ? (
                <button
                  type="button"
                  onClick={() => handleRejectOrder(selectedOrder.id)}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
                >
                  Reject / Cancel Order
                </button>
              ) : (
                <div />
              )}

              <a
                href={`/receipt/${selectedOrder.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-neutral-950 text-white hover:bg-black rounded-xl font-bold text-xs transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Invoice</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
