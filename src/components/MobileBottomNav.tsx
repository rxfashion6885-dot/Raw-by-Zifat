import React from 'react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Home,
  ShoppingBag,
  Grid,
  MessageSquare,
  Compass,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { openSupport } = useStore();
  const { language } = useLanguage();

  const currentPath = window.location.pathname;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around text-[10px] font-bold text-neutral-600">
        <a
          href="/"
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            currentPath === '/' ? 'text-black' : 'hover:text-black'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
        </a>

        <a
          href="/shop"
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            currentPath === '/shop' ? 'text-black' : 'hover:text-black'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{language === 'bn' ? 'শপ' : 'Shop'}</span>
        </a>

        <a
          href="/categories"
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            currentPath === '/categories' ? 'text-black font-extrabold' : 'hover:text-black'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
        </a>

        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-1 p-1.5 hover:text-black transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {totalCount}
              </span>
            )}
          </div>
          <span>{language === 'bn' ? 'কার্ট' : 'Cart'}</span>
        </button>

        <button
          onClick={openSupport}
          className="flex flex-col items-center gap-1 p-1.5 hover:text-black transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span>{language === 'bn' ? 'সাপোর্ট' : 'Support'}</span>
        </button>
      </div>
    </div>
  );
};
