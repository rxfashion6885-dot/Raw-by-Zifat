import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  SlidersHorizontal,
  Search,
  X,
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [onlyCod, setOnlyCod] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Read URL query params on load or prop change
    const params = new URLSearchParams(window.location.search);
    const cat = initialCategory || params.get('category');
    const q = params.get('search');
    const isNew = params.get('newArrival') === 'true';
    const isOffer = params.get('offer') === 'true';

    if (cat) setSelectedCategory(cat);
    if (q) setSearchQuery(q);
    if (isNew) setOnlyNew(true);
    if (isOffer) setOnlyOffers(true);

    async function init() {
      try {
        const [cats, prods] = await Promise.all([api.getCategories(), api.getProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error('Failed to load shop items', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialCategory]);

  // Category selection handler that also updates URL
  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const url = catSlug ? `/shop?category=${encodeURIComponent(catSlug)}` : '/shop';
    window.history.replaceState({}, '', url);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSize('');
    setOnlyCod(false);
    setOnlyOffers(false);
    setOnlyNew(false);
    setSortBy('newest');
    window.history.replaceState({}, '', '/shop');
  };

  // Find active category object if any
  const currentCategoryObj = categories.find(
    (c) =>
      c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
      c.id.toLowerCase() === selectedCategory.toLowerCase() ||
      c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Client-side instant filtering based on active selections
  let filtered = products.filter((p) => {
    if (selectedCategory) {
      const target = selectedCategory.toLowerCase().trim();
      const matchCat = categories.find(
        (c) =>
          c.slug.toLowerCase() === target ||
          c.id.toLowerCase() === target ||
          c.name.toLowerCase() === target
      );

      const targetId = matchCat ? matchCat.id.toLowerCase() : target;
      const targetSlug = matchCat ? matchCat.slug.toLowerCase() : target;
      const targetName = matchCat ? matchCat.name.toLowerCase() : target;

      const pCatId = (p.categoryId || '').toLowerCase();
      const pCatName = (p.categoryName || '').toLowerCase();

      let matched = false;
      if (targetId) {
        matched =
          pCatId === targetId ||
          pCatId === `cat-${targetSlug}` ||
          pCatId === targetSlug ||
          pCatId === target ||
          (targetName && pCatName === targetName) ||
          pCatName === target;
      } else {
        matched =
          pCatId === target ||
          pCatId === `cat-${target}` ||
          pCatName === target ||
          pCatName.includes(target);
      }

      if (!matched) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.categoryName?.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchColor = p.colors.some((c) => c.name.toLowerCase().includes(q));
      if (!matchName && !matchSku && !matchCat && !matchDesc && !matchColor) {
        return false;
      }
    }

    if (selectedSize && !p.sizes.includes(selectedSize)) {
      return false;
    }

    if (onlyCod && !p.codAvailable) {
      return false;
    }

    if (onlyOffers && !p.isOffer && !p.salePrice) {
      return false;
    }

    if (onlyNew && !p.isNewArrival) {
      return false;
    }

    return true;
  });

  // Sorting
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sortBy === 'popular') {
    filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  } else if (sortBy === 'best-selling') {
    filtered.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
  } else {
    // Newest
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-2">
            <a href="/" className="hover:text-black">
              Home
            </a>
            <span>/</span>
            <span className="text-neutral-900">Apparel Catalog</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 uppercase tracking-tight">
                RAW BY ZIFAT SHOP
              </h1>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Showing {filtered.length} curated apparel pieces
              </p>
            </div>

            {/* Mobile Filter Trigger & Sort */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-neutral-800 shadow-xs focus:outline-hidden"
                >
                  <option value="newest">Sort: Newest Drops</option>
                  <option value="popular">Sort: Most Popular</option>
                  <option value="best-selling">Sort: Best Selling</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Category Navigation Chips Bar (Visible on mobile & desktop) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleSelectCategory('')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                selectedCategory === ''
                  ? 'bg-neutral-950 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-black'
              }`}
            >
              All Apparel ({products.length})
            </button>
            {categories.map((c) => {
              const isSelected =
                selectedCategory.toLowerCase() === c.slug.toLowerCase() ||
                selectedCategory.toLowerCase() === c.id.toLowerCase() ||
                selectedCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCategory(c.slug)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs ${
                    isSelected
                      ? 'bg-neutral-950 text-white shadow-md'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-black'
                  }`}
                >
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Banner if category is chosen */}
          {selectedCategory && (
            <div className="mt-3 flex items-center justify-between p-3.5 bg-neutral-900 text-white rounded-2xl animate-fade-in shadow-xs">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="font-semibold text-neutral-400">Viewing Category:</span>
                <span className="font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-lg">
                  {currentCategoryObj ? currentCategoryObj.name : selectedCategory}
                </span>
                <span className="text-neutral-400">({filtered.length} items found)</span>
              </div>
              <button
                onClick={() => handleSelectCategory('')}
                className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white font-bold px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-950">
                  Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-neutral-400 hover:text-black font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Search input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Keyword
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tees, denim..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-neutral-400" />
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
                  Category
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSelectCategory('')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedCategory === ''
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => {
                    const isSelected =
                      selectedCategory.toLowerCase() === c.slug.toLowerCase() ||
                      selectedCategory.toLowerCase() === c.id.toLowerCase() ||
                      selectedCategory.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCategory(c.slug)}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{c.name}</span>
                        {c.productCount !== undefined && (
                          <span className="text-[10px] opacity-60">({c.productCount})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash on Delivery Checkbox Toggle */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Payment Options
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={onlyCod}
                    onChange={(e) => setOnlyCod(e.target.checked)}
                    className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Cash on Delivery Available</span>
                </label>
              </div>

              {/* Sizes Filter */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
                  Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                        selectedSize === sz
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Badges */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Badges
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={onlyOffers}
                    onChange={(e) => setOnlyOffers(e.target.checked)}
                    className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Discounted / Special Offers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={onlyNew}
                    onChange={(e) => setOnlyNew(e.target.checked)}
                    className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
                  />
                  <span>New Arrivals Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-neutral-400">
                Loading products...
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950">No apparel items found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  We could not find any clothing matching your specific combination of filters. Try resetting the filters or searching for another keyword.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="w-full max-w-xs h-full bg-white p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="font-extrabold text-base uppercase tracking-wider text-neutral-950">
                Filter Apparel
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-neutral-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-xs bg-neutral-100 rounded-xl"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Category
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    handleSelectCategory('');
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${
                    selectedCategory === '' ? 'bg-black text-white' : 'bg-neutral-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => {
                  const isSelected =
                    selectedCategory.toLowerCase() === c.slug.toLowerCase() ||
                    selectedCategory.toLowerCase() === c.id.toLowerCase() ||
                    selectedCategory.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        handleSelectCategory(c.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg ${
                        isSelected ? 'bg-black text-white' : 'bg-neutral-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COD Option */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={onlyCod}
                  onChange={(e) => setOnlyCod(e.target.checked)}
                  className="w-4 h-4 rounded-md text-black"
                />
                <span>Cash on Delivery Available</span>
              </label>
            </div>

            {/* Apply & Close */}
            <div className="pt-4 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-black text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
