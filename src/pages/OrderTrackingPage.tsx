import React, { useState, useEffect } from 'react';
import type { Order } from '../types/index.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { showToast } = useStore();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('orderId');
    if (id) {
      setOrderId(id);
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      showToast('Please enter both Order ID and Phone Number', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await api.trackOrder(orderId.trim(), phone.trim());
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      showToast(err.message || 'Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            PARCEL STATUS TRACKING
          </span>
          <h1 className="text-3xl font-black text-neutral-950 uppercase tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Enter your Order ID (from your receipt) and mobile number to track the live progress of your shipment.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Order ID *
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="e.g. RBZ-2026-8492"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-hidden focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Searching Dispatch Records...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>TRACK ORDER STATUS</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results View */}
        {searched && !order && !loading && (
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="font-bold text-base text-neutral-950">No Order Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Please double check your Order ID and the phone number provided at checkout.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm space-y-8 animate-fade-in">
            {/* Header Status */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">ORDER TRACKING</span>
                <h3 className="text-xl font-black font-mono text-neutral-950 mt-0.5">
                  {order.id}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Recipient: {order.customerName} ({order.phone})
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-xs text-neutral-400">Current Status:</span>
                <span className="px-3 py-1 bg-neutral-900 text-white rounded-md text-xs font-bold uppercase tracking-wider">
                  {order.orderStatus}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Payment:{' '}
                  <strong className="uppercase">
                    {order.paymentStatus === 'cod_pending' ? 'Pending COD' : order.paymentStatus}
                  </strong>
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-6">
                Shipment Progression
              </h4>

              {order.orderStatus === 'cancelled' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900">
                  <span className="font-bold block">Order Cancelled</span>
                  This order was cancelled. Stock has been restored and no further delivery will take place.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {steps.map((st, idx) => {
                    const currentIdx = getStepIndex(order.orderStatus);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={st.key} className="relative flex items-center justify-between">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 sm:-left-8 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCurrent
                              ? 'bg-neutral-950 border-neutral-950 text-white scale-110 shadow-md'
                              : isDone
                              ? 'bg-neutral-900 border-neutral-900 text-white'
                              : 'bg-white border-neutral-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>

                        <div>
                          <p
                            className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${
                              isDone ? 'text-neutral-950' : 'text-neutral-400'
                            }`}
                          >
                            {st.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[11px] text-neutral-500 font-medium">
                              Current stage • In transit
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Items Preview */}
            <div className="pt-6 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Items In Parcel
              </h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 text-xs"
                  >
                    <div>
                      <span className="font-bold text-neutral-900">{item.productName}</span>
                      <p className="text-neutral-500 text-[11px]">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-neutral-950">৳{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination */}
            <div className="p-4 bg-neutral-50 rounded-2xl text-xs space-y-1 text-neutral-700">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                Destination Address
              </span>
              <p className="font-semibold text-neutral-900">{order.address}</p>
              <p className="text-neutral-500">{order.district}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
