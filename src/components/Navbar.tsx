import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import {
  ShoppingBag,
  Search,
  MessageSquare,
  ShieldCheck,
  X,
  Menu,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { openSupport, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'New Arrivals', href: '/shop?newArrival=true' },
    { name: 'Offers', href: '/shop?offer=true' },
    { name: 'Track Order', href: '/track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Banner / Announcement bar with Admin Panel Link */}
      <div className="bg-neutral-950 text-white text-[11px] font-semibold tracking-wider text-center py-2 px-4 flex items-center justify-between gap-2 uppercase overflow-hidden">
        <div className="flex-1 text-center truncate">
          <span>FREE EXPRESS SHIPPING ON ORDERS OVER ৳2,500 ACROSS BANGLADESH</span>
        </div>
        <a
          href="/admin/login"
          title="Store Owner & Admin Portal"
          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 shrink-0 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full border border-white/15 transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Admin Panel</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-800 hover:text-black rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Logo Area: RAW BY ZIFAT */}
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <a href="/" className="flex items-center gap-2 group">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="RAW BY ZIFAT" className="h-8 object-contain" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-[0.2em] text-neutral-950 uppercase font-sans group-hover:opacity-80 transition-opacity">
                    RAW BY ZIFAT
                  </span>
                  <span className="text-[9px] tracking-[0.35em] text-neutral-400 uppercase -mt-1 font-bold">
                    EST. DHAKA
                  </span>
                </div>
              )}
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-neutral-700">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black hover:after:w-full after:transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle / Form */}
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-fade-in">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hoodies, oversized, panjabi..."
                  autoFocus
                  className="w-48 sm:w-64 pl-9 pr-8 py-2 text-xs bg-neutral-100 rounded-full border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-black"
                />
                <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                title="Search Products"
                className="p-2 sm:p-2.5 rounded-full hover:bg-neutral-100 text-neutral-800 transition-colors"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Customer Support Trigger */}
            <button
              onClick={openSupport}
              title="Customer Support AI"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-900" />
              <span>Support</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              title="View Cart"
              className="relative p-2 sm:p-2.5 bg-neutral-900 hover:bg-black text-white rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3 animate-slide-down shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clothing..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-neutral-100 rounded-xl border border-neutral-200 focus:outline-hidden"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          </form>

          <div className="flex flex-col gap-2 font-semibold text-sm text-neutral-800">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSupport();
              }}
              className="flex items-center gap-1.5 py-2 px-3 bg-neutral-100 rounded-lg font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Support</span>
            </button>
            <a
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1.5 py-2 px-3 bg-neutral-900 text-white rounded-lg font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Admin Panel</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
