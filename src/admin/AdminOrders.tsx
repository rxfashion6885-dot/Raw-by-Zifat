import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { Order, OrderStatus, PaymentStatus } from '../types/index.js';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronDown,
  Eye,
  AlertCircle,
  Truck,
  Building,
  PhoneCall,
  X,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetOrders({
        status: statusFilter,
        paymentStatus: paymentFilter,
        search: searchQuery,
      });
      setOrders(data);
    } catch {
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order ${orderId} status set to ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleVerifyPayment = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const updated = await api.adminUpdateOrder(orderId, { paymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Payment for ${orderId} marked as ${paymentStatus}`, 'success');
    } catch {
      showToast('Failed to update payment status', 'error');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderId}? This will restore product stock.`)) {
      return;
    }
    try {
      const updated = await api.adminUpdateOrder(orderId, { orderStatus: 'cancelled' });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order ${orderId} cancelled & stock restored`, 'success');
    } catch {
      showToast('Failed to cancel order', 'error');
    }
  };

  return (
    <AdminLayout activeTab="orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              FULFILLMENT & PAYMENTS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Order Management
            </h1>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 hover:border-black transition-colors self-start"
          >
            Refresh Orders
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, phone, customer name, TrxID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-black"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </form>

          {/* Status Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-hidden"
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-hidden"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="cod_pending">COD Pending</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-neutral-400">
              Loading Order Records...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-400">
              No orders found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-neutral-950">
                        {o.id}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-neutral-900 block">{o.customerName}</span>
                        <span className="text-neutral-500 text-[11px] block">{o.phone}</span>
                        <span className="text-neutral-400 text-[10px]">{o.district}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-neutral-800">
                          {o.items.length} items
                        </span>
                        <span className="text-[11px] text-neutral-400 block truncate max-w-xs">
                          {o.items.map((i) => `${i.productName} (${i.size})`).join(', ')}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-black text-neutral-950">
                        ৳{o.total.toLocaleString()}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold uppercase text-[11px] block text-neutral-800">
                          {o.paymentMethod}
                        </span>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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
                          <span className="block font-mono text-[10px] text-neutral-500 mt-0.5">
                            Trx: {o.paymentDetails.transactionId}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            o.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-neutral-900 text-white'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">ORDER RECORD</span>
                <h3 className="text-xl font-black font-mono text-neutral-950 mt-0.5">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient info & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Customer
                </span>
                <p className="font-bold text-sm text-neutral-950">{selectedOrder.customerName}</p>
                <p className="text-neutral-600 mt-0.5">Mobile: {selectedOrder.phone}</p>
                {selectedOrder.alternativePhone && (
                  <p className="text-neutral-500">Alt: {selectedOrder.alternativePhone}</p>
                )}
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Delivery Destination
                </span>
                <p className="font-semibold text-neutral-900">{selectedOrder.address}</p>
                <p className="text-neutral-500 mt-0.5">
                  {selectedOrder.area ? `${selectedOrder.area}, ` : ''}{selectedOrder.district}
                </p>
                {selectedOrder.deliveryNote && (
                  <p className="text-neutral-600 italic mt-1">Note: "{selectedOrder.deliveryNote}"</p>
                )}
              </div>
            </div>

            {/* Manual bKash / Nagad Payment Verification Details */}
            {selectedOrder.paymentMethod !== 'cod' && selectedOrder.paymentDetails && (
              <div className="p-4 bg-pink-50/50 border border-pink-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-pink-900">
                  <span className="uppercase">{selectedOrder.paymentMethod} Payment Verification</span>
                  <span className="font-mono">Amount: ৳{selectedOrder.total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-neutral-700">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-bold">Sender Phone</span>
                    <span className="font-mono font-bold text-sm">
                      {selectedOrder.paymentDetails.senderPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-bold">Transaction ID (TrxID)</span>
                    <span className="font-mono font-bold text-sm text-pink-800">
                      {selectedOrder.paymentDetails.transactionId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'verified')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    ✓ Approve Payment
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id, 'rejected')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors"
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
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900">{it.productName}</span>
                      <p className="text-neutral-500 text-[11px]">
                        Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-950">৳{it.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 flex justify-between text-xs font-bold text-neutral-900 px-1">
                <span>Grand Total (Delivery included)</span>
                <span className="text-sm">৳{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Update Status Controls */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Change Order Status
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

            {/* Danger Actions & Print */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => handleCancelOrder(selectedOrder.id)}
                disabled={selectedOrder.orderStatus === 'cancelled'}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors disabled:opacity-40"
              >
                Cancel Order & Restore Stock
              </button>

              <a
                href={`/receipt/${selectedOrder.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white hover:bg-black rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Invoice</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
