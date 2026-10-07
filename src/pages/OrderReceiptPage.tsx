import React, { useState, useEffect } from 'react';
import type { Order } from '../types/index.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import {
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Truck,
  Building,
} from 'lucide-react';

interface OrderReceiptPageProps {
  orderId: string;
}

export const OrderReceiptPage: React.FC<OrderReceiptPageProps> = ({ orderId }) => {
  const { showToast, settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // For receipt view immediately after checkout or via public link,
    // fetch order status using track endpoint or public info
    async function fetchReceipt() {
      try {
        // Query server for order details
        const res = await fetch(`/api/orders/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, phone: '' }),
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          // If phone was required, check if we have recently placed order stored in sessionStorage
          const recent = sessionStorage.getItem('last_order_receipt');
          if (recent) {
            const parsed = JSON.parse(recent);
            if (parsed.id === orderId) {
              setOrder(parsed);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    // Try reading cached order from window/localStorage if server requires phone
    const cachedOrder = localStorage.getItem(`rbz_order_${orderId}`);
    if (cachedOrder) {
      try {
        setOrder(JSON.parse(cachedOrder));
        setLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    fetchReceipt();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyOrderId = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(orderId);
      }
      setCopied(true);
      showToast('Order ID copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy Order ID', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Generating Official Receipt...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header banner (Hidden during print) */}
        <div className="print:hidden text-center mb-8 space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Thank you for ordering with RAW BY ZIFAT. We have received your order and will dispatch it shortly.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 hover:border-black rounded-xl text-xs font-bold text-neutral-800 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <a
              href={`/track?orderId=${orderId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Track Status</span>
            </a>
          </div>
        </div>

        {/* Printable Official Receipt Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200/90 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
          {/* Receipt Top: Brand & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-neutral-100">
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-[0.2em] text-neutral-950 uppercase font-sans">
                RAW BY ZIFAT
              </span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-0.5">
                Modern Bangladeshi Streetwear
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Banani 11, Dhaka 1213, Bangladesh<br />
                Hotline: {settings?.phone || '+880 1712-345678'}
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Official Order Receipt
              </span>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-lg font-black font-mono text-neutral-950">
                  {orderId}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="print:hidden p-1 text-neutral-400 hover:text-black transition-colors"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Summary */}
          {order && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-700 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Recipient Information
                </span>
                <p className="font-bold text-sm text-neutral-950">{order.customerName}</p>
                <p className="text-neutral-600 mt-0.5">Phone: {order.phone}</p>
                {order.alternativePhone && (
                  <p className="text-neutral-500">Alt Phone: {order.alternativePhone}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Delivery Destination
                </span>
                <p className="font-semibold text-neutral-900">{order.address}</p>
                <p className="text-neutral-500 mt-0.5">{order.area ? `${order.area}, ` : ''}{order.district}</p>
              </div>
            </div>
          )}

          {/* Items Table */}
          {order?.items && order.items.length > 0 && (
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-400">
                    <th className="pb-3 font-bold">Item Description</th>
                    <th className="pb-3 font-bold text-center">Size</th>
                    <th className="pb-3 font-bold text-center">Qty</th>
                    <th className="pb-3 font-bold text-right">Price</th>
                    <th className="pb-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {order.items.map((item, i) => (
                    <tr key={i} className="text-neutral-800">
                      <td className="py-3 font-semibold text-neutral-950">
                        {item.productName}
                        {item.color && <span className="text-neutral-400 font-normal"> ({item.color})</span>}
                      </td>
                      <td className="py-3 text-center font-bold text-neutral-700">{item.size}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">৳{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-neutral-950">
                        ৳{item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">৳{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-neutral-900">
                    {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-৳{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-neutral-950">Total Paid / Due</span>
                  <span className="text-xl font-black text-neutral-950">
                    ৳{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment & Order Status Badges */}
          {order && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  Payment Method
                </span>
                <span className="font-bold uppercase text-neutral-900">
                  {order.paymentMethod === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : order.paymentMethod.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  Payment Status
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  {order.paymentStatus === 'cod_pending' ? 'Pending on Delivery' : order.paymentStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                  Order Status
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          )}

          {/* Receipt Footer Note */}
          <div className="pt-6 border-t border-neutral-100 text-center text-[11px] text-neutral-400 leading-relaxed">
            <p>Thank you for choosing RAW BY ZIFAT. We craft every garment with pride in Bangladesh.</p>
            <p>For questions or size exchange within 3 days, contact our helpline: {settings?.phone || '+880 1712-345678'}</p>
          </div>
        </div>

        {/* Continue shopping link */}
        <div className="text-center mt-8 print:hidden">
          <a
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-black inline-flex items-center gap-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
