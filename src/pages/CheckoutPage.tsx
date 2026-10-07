import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { api } from '../services/api.js';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Tag,
  CreditCard,
  Banknote,
  PhoneCall,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    subtotal,
    clearCart,
    isCodAvailable,
    codRestrictionReason,
  } = useCart();
  const { settings, showToast } = useStore();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment Method: 'cod' | 'bkash' | 'nagad'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Set default payment method if COD is unavailable
  useEffect(() => {
    if (!isCodAvailable && paymentMethod === 'cod') {
      setPaymentMethod('bkash');
    }
  }, [isCodAvailable, paymentMethod]);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-16 h-16 stroke-[1.2] text-neutral-300 mx-auto" />
          <h2 className="text-2xl font-black text-neutral-950 uppercase tracking-tight">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Please add clothing items to your cart before proceeding to checkout.
          </p>
          <a
            href="/shop"
            className="inline-block px-8 py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Explore Apparel
          </a>
        </div>
      </div>
    );
  }

  // Delivery Charge calculation
  const isInsideDhaka = district.toLowerCase().includes('dhaka');
  const insideCharge = settings?.deliverySettings.insideDhakaCharge ?? 60;
  const outsideCharge = settings?.deliverySettings.outsideDhakaCharge ?? 120;
  const freeThreshold = settings?.deliverySettings.freeDeliveryThreshold ?? 2500;

  let deliveryCharge = isInsideDhaka ? insideCharge : outsideCharge;
  if (subtotal >= freeThreshold) {
    deliveryCharge = 0;
  }

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.applyCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon({ code: res.code, discount: res.discount });
      showToast(`Coupon ${res.code} applied! Saved ৳${res.discount}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon', 'error');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Please enter your mobile phone number', 'error');
      return;
    }
    if (!address.trim()) {
      showToast('Please enter your full delivery address', 'error');
      return;
    }

    if (paymentMethod === 'cod' && !isCodAvailable) {
      showToast(codRestrictionReason || 'Cash on Delivery is unavailable for these items', 'error');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!senderPhone.trim() || !transactionId.trim())) {
      showToast(`Please enter your ${paymentMethod.toUpperCase()} sender phone and Transaction ID`, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        alternativePhone: alternativePhone.trim() || undefined,
        district,
        area: area.trim() || district,
        address: address.trim(),
        deliveryNote: deliveryNote.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentDetails:
          paymentMethod !== 'cod'
            ? {
                senderPhone: senderPhone.trim(),
                transactionId: transactionId.trim(),
                amount: total,
              }
            : undefined,
      };

      const response = await api.placeOrder(orderPayload);
      if (response.success && response.order) {
        clearCart();
        showToast('Order created successfully!', 'success');
        window.location.href = `/receipt/${response.order.id}`;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const bkashConfig = settings?.paymentSettings.bkash;
  const nagadConfig = settings?.paymentSettings.nagad;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">
            <a href="/" className="hover:text-black">
              Home
            </a>
            <span>/</span>
            <a href="/shop" className="hover:text-black">
              Shop
            </a>
            <span>/</span>
            <span className="text-neutral-900">Guest Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 uppercase tracking-tight">
            Checkout & Delivery
          </h1>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            ⚡ Complete your order as a guest. No account required.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Delivery & Payment Details (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Customer Delivery Information */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                    Delivery Address
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black"
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
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Alternative Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={alternativePhone}
                      onChange={(e) => setAlternativePhone(e.target.value)}
                      placeholder="e.g. 01812345678"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      District / City *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black font-semibold"
                    >
                      <option value="Dhaka">Dhaka (Inside City - ৳{insideCharge})</option>
                      <option value="Chittagong">Chittagong (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Sylhet">Sylhet (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Rajshahi">Rajshahi (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Khulna">Khulna (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Barisal">Barisal (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Rangpur">Rangpur (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Mymensingh">Mymensingh (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Comilla">Comilla (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Gazipur">Gazipur (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Narayanganj">Narayanganj (Outside Dhaka - ৳{outsideCharge})</option>
                      <option value="Other District">Other District (৳{outsideCharge})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Area / Thana / Post Code
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Banani / Dhanmondi"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Full Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Road, Block, Flat or Landmark details..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g. Please call before arriving / Deliver after 4 PM"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Configuration */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950">
                    Payment Method
                  </h3>
                </div>

                {/* COD Warning if restricted */}
                {!isCodAvailable && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm block mb-0.5">
                        Cash on Delivery Restriction Notice
                      </span>
                      <p>{codRestrictionReason}</p>
                      <p className="mt-1 font-semibold text-amber-950">
                        Please choose bKash or Nagad below to complete this order.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Method Radio Selection */}
                <div className="space-y-3">
                  {/* Option: Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                      !isCodAvailable
                        ? 'opacity-40 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                        : paymentMethod === 'cod'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs cursor-pointer'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      disabled={!isCodAvailable}
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 w-4 h-4 text-black focus:ring-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-950">Cash on Delivery (COD)</span>
                        <Banknote className="w-5 h-5 text-neutral-700" />
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {isCodAvailable
                          ? 'Pay in cash directly to delivery personnel when parcel arrives.'
                          : 'Unavailable because an item in your cart requires online prepayment.'}
                      </p>
                    </div>
                  </label>

                  {/* Option: bKash */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50/40 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 w-4 h-4 text-pink-600 focus:ring-pink-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-950">bKash Manual Payment</span>
                        <span className="px-2 py-0.5 bg-pink-100 text-pink-700 font-extrabold text-xs rounded-md">
                          bKash
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Send Money to our verified bKash number ({bkashConfig?.number || '01812345678'}).
                      </p>
                    </div>
                  </label>

                  {/* Option: Nagad */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-950">Nagad Manual Payment</span>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-extrabold text-xs rounded-md">
                          Nagad
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Send Money to our verified Nagad number ({nagadConfig?.number || '01612345678'}).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Sub-Panel: bKash/Nagad Instructions & Input Fields */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <PhoneCall className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          {paymentMethod.toUpperCase()} Payment Account
                        </span>
                        <div className="text-lg font-black font-mono text-neutral-950 mt-0.5">
                          {paymentMethod === 'bkash' ? bkashConfig?.number : nagadConfig?.number}
                        </div>
                        <span className="text-[11px] font-semibold text-neutral-500">
                          Account Type:{' '}
                          {paymentMethod === 'bkash'
                            ? bkashConfig?.accountType
                            : nagadConfig?.accountType}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
                      <span className="font-bold block mb-1">Payment Instructions:</span>
                      {paymentMethod === 'bkash'
                        ? bkashConfig?.instructions
                        : nagadConfig?.instructions}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Sender Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Transaction ID (TrxID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          placeholder="e.g. 9B8C7A6D"
                          className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold uppercase focus:outline-hidden focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400">
                      ℹ️ Order status will be marked "Pending Payment Verification" until reviewed by admin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs space-y-5 sticky top-24">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-950 pb-4 border-b border-neutral-100">
                  Order Summary ({items.length} items)
                </h3>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex items-center gap-3 py-1"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                        <p className="text-[11px] text-neutral-500">
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-neutral-950 shrink-0">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-3 border-t border-neutral-100">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Have a promo coupon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. RAW10"
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black disabled:opacity-40 transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="font-semibold">Coupon "{appliedCoupon.code}" applied!</span>
                      <span className="font-bold">-৳{appliedCoupon.discount}</span>
                    </div>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">৳{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>
                      Delivery ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})
                    </span>
                    <span className="font-bold text-neutral-900">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">
                          Free Shipping
                        </span>
                      ) : (
                        `৳${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-neutral-950">Grand Total</span>
                    <span className="text-2xl font-black text-neutral-950">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-neutral-950 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CREATING ORDER...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM & PLACE ORDER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-center text-neutral-400 space-y-1">
                  <p>🔒 256-bit Encrypted Checkout • Official Bangladeshi Brand</p>
                  <p>Order receipt with tracking code will be generated immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
