import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  AlertTriangle,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    subtotal,
    isCodAvailable,
    codRestrictionReason,
    isCartOpen,
    closeCart,
  } = useCart();
  const { settings } = useStore();
  const { language, t } = useLanguage();

  if (!isCartOpen) return null;

  const freeThreshold = settings?.deliverySettings.freeDeliveryThreshold || 2500;
  const awayFromFree = Math.max(0, freeThreshold - subtotal);
  const freeProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h3 className="font-extrabold text-base tracking-tight text-neutral-900">
              {language === 'bn' ? `আপনার কার্ট (${totalCount})` : `YOUR CART (${totalCount})`}
            </h3>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-neutral-900" />
              {awayFromFree === 0 ? (
                <span className="text-emerald-700 font-bold">
                  {language === 'bn' ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!' : 'You unlocked FREE Delivery across Bangladesh!'}
                </span>
              ) : (
                <span>
                  {language === 'bn'
                    ? `ফ্রি ডেলিভারির জন্য আরও ৳${awayFromFree.toLocaleString()} টাকার অর্ডার করুন`
                    : `Add ৳${awayFromFree.toLocaleString()} more for FREE Delivery`}
                </span>
              )}
            </span>
            <span>{freeProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeProgress}%` }}
            />
          </div>
        </div>

        {/* COD Restriction Alert if applicable */}
        {!isCodAvailable && (
          <div className="mx-6 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cash on Delivery Notice:</span>
              <p className="mt-0.5">{codRestrictionReason}</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-12">
              <ShoppingBag className="w-16 h-16 stroke-[1.2] mb-3 text-neutral-300" />
              <p className="text-base font-semibold text-neutral-700">
                {language === 'bn' ? 'আপনার কার্ট খালি রয়েছে' : 'Your cart is empty'}
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                {language === 'bn' ? 'আমাদের নতুন কালেকশন ঘুরে দেখুন।' : 'Explore our minimalist streetwear and contemporary clothing collections.'}
              </p>
              <a
                href="/shop"
                onClick={closeCart}
                className="mt-5 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                {language === 'bn' ? 'শপিং শুরু করুন' : 'Start Shopping'}
              </a>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 p-3 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-24 object-cover rounded-xl bg-neutral-100 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-semibold text-neutral-900 hover:underline line-clamp-1"
                      >
                        {item.name}
                      </a>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {item.size}
                      </span>
                      <span>•</span>
                      <span>{item.color}</span>
                    </div>

                    {!item.codAvailable && (
                      <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium border border-amber-200">
                        Prepaid only
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                        }
                        className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                        }
                        className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-neutral-950">
                      ৳{(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50/70 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Estimated Delivery</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-neutral-900">Total</span>
              <span className="text-xl font-extrabold text-neutral-950">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={clearCart}
                className="px-3 py-3 border border-neutral-200 text-neutral-500 hover:text-neutral-900 rounded-xl text-xs font-semibold hover:bg-white transition-colors"
              >
                {language === 'bn' ? 'খালি করুন' : 'Clear'}
              </button>
              <a
                href="/checkout"
                onClick={closeCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg active:scale-[0.98]"
              >
                <span>{language === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'PROCEED TO CHECKOUT'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[11px] text-center text-neutral-400">
              {language === 'bn' ? '⚡ গেস্ট চেকআউট: কোনো অ্যাকাউন্টের প্রয়োজন নেই' : '⚡ Guest checkout: No account or registration needed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
