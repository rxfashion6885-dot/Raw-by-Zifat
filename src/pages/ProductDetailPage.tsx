import React, { useState, useEffect } from 'react';
import type { Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  ShoppingBag,
  Share2,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Plus,
  Minus,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { addToCart } = useCart();
  const { showToast, settings } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProduct(slug);
        setProduct(data);
        setSelectedImage(data.thumbnail || data.images[0]);
        setSelectedSize(data.sizes[0] || 'M');
        setSelectedColor(data.colors[0]?.name || 'Standard');

        // Dynamically update document title and meta for SEO / Social
        document.title = `${data.name} | RAW BY ZIFAT`;

        // Load related items in the same category
        const all = await api.getProducts({ category: data.categoryId });
        setRelatedProducts(all.filter((p) => p.id !== data.id).slice(0, 4));
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-bold text-neutral-400">
            Loading Apparel Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl font-black text-neutral-950 uppercase">Product Not Found</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The requested clothing item ({slug}) does not exist or may have been unpublished.
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  const currentPrice = product.salePrice || product.price;
  const isOutOfStock = product.stockQuantity <= 0;
  const canonicalUrl = `${window.location.origin}/product/${product.slug}`;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    showToast(`Added ${quantity}x ${product.name} (${selectedSize}) to cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    window.location.href = '/checkout';
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const input = document.createElement('input');
        input.value = canonicalUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast('Product link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | RAW BY ZIFAT`,
          text: `Check out ${product.name} at RAW BY ZIFAT:`,
          url: canonicalUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      setShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-8 overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:text-black">
            Home
          </a>
          <span>/</span>
          <a href="/shop" className="hover:text-black">
            Shop
          </a>
          <span>/</span>
          <a href={`/shop?category=${product.categoryId}`} className="hover:text-black">
            {product.categoryName || 'Apparel'}
          </a>
          <span>/</span>
          <span className="text-neutral-900 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-xs">
          {/* Left Column: Gallery & Thumbnails (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail list */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[560px] no-scrollbar shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 bg-neutral-100 transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-neutral-950 scale-102 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Large Active Image */}
            <div className="relative flex-1 aspect-3/4 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 group">
              <img
                src={selectedImage || product.thumbnail || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {product.discountPercent && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                  {product.discountPercent}% OFF
                </div>
              )}

              {/* Quick Share Button Overlay */}
              <button
                onClick={handleNativeShare}
                title="Share this product"
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-neutral-800 hover:text-black shadow-lg backdrop-blur-xs transition-transform active:scale-95"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Product Details & Buying Actions (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, SKU, and Stock Status */}
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
                <span className="uppercase tracking-widest text-neutral-900 font-bold">
                  {product.categoryName || 'Apparel'}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-black text-neutral-950">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-base text-neutral-400 line-through font-semibold">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    Save ৳{(product.price - product.salePrice!).toLocaleString()}
                  </span>
                )}
              </div>

              {/* CASH ON DELIVERY AVAILABILITY NOTICE (CRITICAL REQUIREMENT) */}
              <div className="pt-2">
                {product.codAvailable ? (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Cash on Delivery Available</span>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        Pay upon receiving parcel anywhere in Bangladesh.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Cash on Delivery is NOT available for this product</span>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        This exclusive piece requires advance payment via bKash or Nagad.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-2">
                    <span className="uppercase tracking-wider">Color: {selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedColor === c.name
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-2">
                  <span className="uppercase tracking-wider">Select Size</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Stock: {product.stockQuantity} units
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-12 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        selectedSize === sz
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-md'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                  Quantity
                </span>
                <div className="flex items-center w-36 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 hover:bg-neutral-200 disabled:opacity-40 transition-colors text-neutral-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2.5 hover:bg-neutral-200 disabled:opacity-40 transition-colors text-neutral-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 border-2 border-neutral-950 hover:bg-neutral-100 text-neutral-950 rounded-2xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-xs active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-neutral-950 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg active:scale-[0.98]"
                >
                  <span>BUY NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Share Bar */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-100 text-xs">
                <span className="text-neutral-500 font-medium">Share this direct product link:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-neutral-700 font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Check out ${product.name} on RAW BY ZIFAT: ${canonicalUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-emerald-600 hover:text-emerald-600 text-neutral-700 transition-colors"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Specifications & Garment Details */}
            <div className="pt-6 border-t border-neutral-100 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-1.5">
                  Garment & Fabric Specifications
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {product.description}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-700">
                  <div className="p-2.5 bg-neutral-50 rounded-xl">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                      Fabric
                    </span>
                    <span className="font-semibold">{product.material || 'Combed Cotton'}</span>
                  </div>
                  {product.gsm && (
                    <div className="p-2.5 bg-neutral-50 rounded-xl">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                        Weight
                      </span>
                      <span className="font-semibold">{product.gsm} GSM Heavyweight</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Assurance */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 text-xs text-neutral-700">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <Truck className="w-4 h-4" />
                  <span>Bangladeshi Delivery Network</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Inside Dhaka: ৳{settings?.deliverySettings.insideDhakaCharge || 60} (24-48 hrs).
                  Outside Dhaka: ৳{settings?.deliverySettings.outsideDhakaCharge || 120} (48-72 hrs).
                  Free delivery across BD on orders over ৳{settings?.deliverySettings.freeDeliveryThreshold || 2500}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Clothing Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-200/80">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                  COMPLETE THE LOOK
                </span>
                <h3 className="text-2xl font-black text-neutral-950 uppercase tracking-tight mt-1">
                  Related Apparel
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Direct Link Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-neutral-950 uppercase">
              Share Direct Link
            </h4>
            <p className="text-xs text-neutral-500">
              Paste this URL into your Facebook posts, TikTok videos, or WhatsApp messages:
            </p>
            <div className="p-3 bg-neutral-100 rounded-xl text-xs font-mono text-neutral-800 break-all select-all">
              {canonicalUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
