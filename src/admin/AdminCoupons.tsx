import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { Coupon } from '../types/index.js';
import { Plus, Trash2, Tag, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('1000');
  const [maxDiscount, setMaxDiscount] = useState('300');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetCoupons();
      setCoupons(data);
    } catch {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await api.adminCreateCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        timesUsed: 0,
        isActive: true,
      });
      showToast(`Coupon ${code} created`, 'success');
      setIsModalOpen(false);
      setCode('');
      fetchCoupons();
    } catch {
      showToast('Failed to create coupon', 'error');
    }
  };

  const handleDelete = async (couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"?`)) return;
    try {
      await api.adminDeleteCoupon(couponCode);
      showToast(`Coupon "${couponCode}" deleted`, 'success');
      fetchCoupons();
    } catch {
      showToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <AdminLayout activeTab="coupons">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              PROMOTIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Coupons & Discounts
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase">
                    {c.code}
                  </span>
                  <div className="text-xl font-black text-neutral-950 mt-2">
                    {c.discountType === 'percent'
                      ? `${c.discountValue}% OFF`
                      : `৳${c.discountValue} FLAT OFF`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.code)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-neutral-500 space-y-1">
                <p>Min. Purchase: ৳{c.minOrderAmount || 0}</p>
                {c.maxDiscount && <p>Max Discount Cap: ৳{c.maxDiscount}</p>}
                <p className="text-neutral-400">Used: {c.timesUsed} times</p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-700">● Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base uppercase text-neutral-950">
                Create Discount Coupon
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RAW20"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Minimum Order (BDT ৳)
                </label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              {discountType === 'percent' && (
                <div>
                  <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="300"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
