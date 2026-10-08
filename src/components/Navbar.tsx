import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  ShoppingBag,
  Search,
  MessageSquare,
  X,
  MoreVertical,
  Globe,
  Check,
  Truck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { openSupport, settings, openDevProfile } = useStore();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);

  const leftMenuRef = useRef<HTMLDivElement>(null);

  // Close left menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leftMenuRef.current && !leftMenuRef.current.contains(event.target as Node)) {
        setIsLeftMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.shop'), href: '/shop' },
    { name: t('nav.categories'), href: '/categories' },
    { name: t('nav.newArrivals'), href: '/shop?newArrival=true' },
    { name: t('nav.offers'), href: '/shop?offer=true' },
    { name: t('nav.trackOrder'), href: '/track' },
  ];

  const developerWhatsAppUrl = `https://wa.me/8801752714034?text=${encodeURIComponent(
    'Hello SYM_DEV! I am contacting you from RAW BY ZIFAT official store.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 transition-all shadow-xs">
      {/* Top Banner / Announcement bar - 4K High Definition Styling */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white text-[11px] font-semibold tracking-wider text-center py-2 px-4 flex items-center justify-center uppercase overflow-hidden border-b border-neutral-800">
        <span className="truncate flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          {settings?.announcementBar || t('nav.announcement')}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* LEFT SIDE: 3-DOT MENU BUTTON & LOGO (Moved from right side as requested) */}
          <div className="flex items-center gap-3">
            {/* 3-DOT MENU (ON LEFT SIDE ONLY) */}
            <div className="relative" ref={leftMenuRef}>
              <button
                onClick={() => setIsLeftMenuOpen((prev) => !prev)}
                title="Options, Language & Developer Profile"
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  isLeftMenuOpen
                    ? 'bg-neutral-950 text-white shadow-md ring-2 ring-neutral-400'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-900 border border-neutral-300/80 hover:border-black active:scale-95'
                }`}
                aria-label="Open Left Menu"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* LEFT SIDE DROPDOWN / MENU DRAWER */}
              {isLeftMenuOpen && (
                <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-neutral-200/90 py-4 px-4 z-50 animate-in fade-in zoom-in-95 duration-200 divide-y divide-neutral-100 max-h-[85vh] overflow-y-auto">
                  
                  {/* 1. Language Selection (Banglish & Bangla) */}
                  <div className="pb-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Bhasha / ভাষা নির্বাচন</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded-full border border-neutral-200">
                        {language === 'bn' ? 'বাংলা হরফ' : 'English (Banglish)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
                      {/* Banglish (English letters speaking Bengali) */}
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('en');
                          setIsLeftMenuOpen(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          language === 'en'
                            ? 'bg-neutral-950 text-white shadow-md'
                            : 'text-neutral-700 hover:text-black hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🇬🇧</span>
                          <span>English</span>
                          {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className={`text-[10px] ${language === 'en' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          (Bangla in English)
                        </span>
                      </button>

                      {/* Bangla (Bengali Script) */}
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('bn');
                          setIsLeftMenuOpen(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          language === 'bn'
                            ? 'bg-neutral-950 text-white shadow-md'
                            : 'text-neutral-700 hover:text-black hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🇧🇩</span>
                          <span>বাংলা</span>
                          {language === 'bn' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className={`text-[10px] ${language === 'bn' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          (বাংলা হরফ)
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 2. DEVELOPER PROFILE CARD (SYM_DEV, sayeemdev69.netlify.app, 01752714034 WhatsApp) */}
                  <div className="py-3.5">
                    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-2xl p-4 shadow-xl border border-neutral-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          DEVELOPER PROFILE
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700">
                          CYBER DEV
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80"
                            alt="SYM_DEV"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-sm bg-neutral-800"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-white tracking-wide truncate">
                            SYM_DEV
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">
                            Cyber Full-Stack Engineer & Creator
                          </p>
                          <a
                            href="https://sayeemdev69.netlify.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 underline underline-offset-2 mt-0.5"
                          >
                            <span>sayeemdev69.netlify.app</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* WhatsApp Direct Action Button */}
                      <a
                        href={developerWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-neutral-950 font-extrabold rounded-xl text-xs transition-all shadow-md group"
                      >
                        <MessageCircle className="w-4 h-4 text-neutral-950 fill-neutral-950 group-hover:scale-110 transition-transform" />
                        <span>WhatsApp Contact (01752714034)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setIsLeftMenuOpen(false);
                          openDevProfile();
                        }}
                        className="w-full mt-2 text-center text-[10px] text-neutral-400 hover:text-white transition-colors py-1 font-semibold"
                      >
                        View Full Developer Portfolio & Bio →
                      </button>
                    </div>
                  </div>

                  {/* 3. Quick Store Links */}
                  <div className="py-2.5 space-y-1">
                    <a
                      href="/track"
                      onClick={() => setIsLeftMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors"
                    >
                      <Truck className="w-4 h-4 text-neutral-500" />
                      <span>{language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Order Track Korun'}</span>
                    </a>

                    <a
                      href="/categories"
                      onClick={() => setIsLeftMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors"
                    >
                      <Layers className="w-4 h-4 text-neutral-500" />
                      <span>{language === 'bn' ? 'সব ক্যাটাগরি' : 'Category Shomuh'}</span>
                    </a>

                    <a
                      href="/shop?offer=true"
                      onClick={() => setIsLeftMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{language === 'bn' ? 'স্পেশাল অফার সমূহ' : 'Special Offers'}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLeftMenuOpen(false);
                        openSupport();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors text-left"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>{language === 'bn' ? 'কাস্টমার কেয়ার AI' : 'Customer Support AI'}</span>
                    </button>
                  </div>

                  {/* 4. Navigation Links for Mobile in Left Drawer */}
                  <div className="pt-2.5 md:hidden space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3">
                      Pages
                    </span>
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsLeftMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-100 hover:text-black"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logo Area: RAW BY ZIFAT */}
            <a href="/" className="flex items-center gap-2 group">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="RAW BY ZIFAT" className="h-8 object-contain" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-[0.2em] text-neutral-950 uppercase font-sans group-hover:opacity-80 transition-opacity">
                    RAW BY ZIFAT
                  </span>
                  <span className="text-[9px] tracking-[0.35em] text-neutral-400 uppercase -mt-1 font-bold">
                    EST. DHAKA • 4K ULTRA
                  </span>
                </div>
              )}
            </a>
          </div>

          {/* Desktop Center Navigation Links */}
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

          {/* RIGHT SIDE: ONLY SEARCH, SUPPORT, AND CART (NO 3-DOT MENU ON RIGHT SIDE AS REQUESTED!) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle / Form */}
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  autoFocus
                  className="w-44 sm:w-64 pl-9 pr-8 py-2 text-xs bg-neutral-100 rounded-full border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-black"
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

            {/* Customer Support AI Trigger */}
            <button
              onClick={openSupport}
              title="Customer Support AI"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-neutral-900" />
              <span>{t('nav.support')}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              title="View Cart"
              className="relative p-2 sm:p-2.5 bg-neutral-950 hover:bg-black text-white rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center ring-2 ring-neutral-200/50"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
