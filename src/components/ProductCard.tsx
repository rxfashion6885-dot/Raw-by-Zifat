import React, { useState } from 'react';
import type { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { ShoppingBag, Share2, Check, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useStore();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');

  const currentPrice = product.salePrice || product.price;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = `${window.location.origin}/product/${product.slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const input = document.createElement('input');
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      setCopied(true);
      showToast(language === 'bn' ? `লিংক কপি হয়েছে: /product/${product.slug}` : `Link copied: /product/${product.slug}`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(language === 'bn' ? 'লিংক কপি করা যায়নি' : 'Could not copy link', 'error');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      showToast(language === 'bn' ? 'দুঃখিত, এই পণ্যটির স্টক শেষ' : 'This product is out of stock', 'error');
      return;
    }

    addToCart(product, selectedSize, product.colors[0]?.name || 'Standard', 1);
    showToast(
      language === 'bn'
        ? `${product.name} (${selectedSize}) কার্টে যোগ হয়েছে`
        : `Added ${product.name} (${selectedSize}) to Cart`,
      'success'
    );
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-400 transition-all duration-300">
      {/* Product Image Container */}
      <a
        href={`/product/${product.slug}`}
        className="relative block aspect-3/4 w-full overflow-hidden bg-neutral-100"
      >
        <img
          src={product.thumbnail || product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.salePrice && product.discountPercent && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-red-600 text-white rounded-md shadow-xs">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-neutral-900 text-white rounded-md shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* COD Indicator Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          {product.codAvailable ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/95 text-neutral-800 rounded-md backdrop-blur-xs border border-neutral-200 shadow-xs">
              {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'COD Available'}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/95 text-white rounded-md shadow-xs">
              {language === 'bn' ? 'অগ্রিম পেমেন্ট' : 'Prepayment Only'}
            </span>
          )}
        </div>

        {/* Share Button on Top Right */}
        <button
          onClick={handleCopyLink}
          title={language === 'bn' ? 'লিংক কপি করুন' : 'Share / Copy Link'}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950 shadow-md backdrop-blur-xs transition-transform active:scale-95 z-10"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg">
              {language === 'bn' ? 'স্টক শেষ' : 'Sold Out'}
            </span>
          </div>
        )}
      </a>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium mb-1">
            <span className="uppercase tracking-wider">{product.categoryName || 'Apparel'}</span>
            <span>{product.sku}</span>
          </div>

          {/* Product Name */}
          <a
            href={`/product/${product.slug}`}
            className="block text-sm font-semibold text-neutral-900 group-hover:text-black line-clamp-1 hover:underline transition-colors"
          >
            {product.name}
          </a>

          {/* Fabric / GSM */}
          {product.gsm && (
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {product.gsm} GSM • {product.material || 'Combed Cotton'}
            </p>
          )}

          {/* Size Pills */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(s);
                }}
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border transition-colors ${
                  selectedSize === s
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-neutral-950">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-xs text-neutral-400 line-through">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              title="Add to Cart"
              className="p-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl transition-all active:scale-95 disabled:opacity-40"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <a
              href={`/product/${product.slug}`}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-all"
              title="View Details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
