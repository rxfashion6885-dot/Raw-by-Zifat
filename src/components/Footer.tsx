import React from 'react';
import { useStore } from '../context/StoreContext.js';
import {
  Globe,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, openDevProfile, openSupport } = useStore();

  const currentYear = new Date().getFullYear();
  const profile = settings?.developerProfile;

  return (
    <footer className="bg-white border-t border-neutral-200 mt-20 pt-16 pb-24 md:pb-12 text-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Core Promises */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral-100 rounded-xl shrink-0">
              <Truck className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Express Delivery
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                24-48 hrs in Dhaka • Across all 64 districts
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral-100 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Genuine Apparel
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Combed organic cotton & natural linen
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral-100 rounded-xl shrink-0">
              <RotateCcw className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Easy Size Exchange
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                Hassle-free 3-day exchange guarantee
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-neutral-100 rounded-xl shrink-0">
              <Headphones className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                Direct Support
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                AI Assistant & hotline 7 days a week
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12 border-b border-neutral-100">
          {/* Brand Intro */}
          <div className="space-y-4">
            <a href="/" className="inline-block">
              <span className="text-2xl font-black tracking-[0.2em] text-neutral-950 uppercase font-sans">
                RAW BY ZIFAT
              </span>
            </a>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
              Contemporary Bangladeshi fashion house engineered around heavy fabrics, drop-shoulder silhouettes, and minimalist traditional linen. Pure streetwear discipline.
            </p>
            <div className="pt-1 flex items-center gap-3">
              {profile?.facebook && (
                <a
                  href={profile.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors text-neutral-700"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {profile?.whatsapp && (
                <a
                  href={profile.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-neutral-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors text-neutral-700"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Clothing Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600 font-medium">
              <li>
                <a href="/shop?category=oversized" className="hover:text-black transition-colors">
                  Oversized T-Shirts (260 GSM)
                </a>
              </li>
              <li>
                <a href="/shop?category=panjabi" className="hover:text-black transition-colors">
                  Artisanal Linen Panjabi
                </a>
              </li>
              <li>
                <a href="/shop?category=hoodies" className="hover:text-black transition-colors">
                  French Terry Hoodies & Sweats
                </a>
              </li>
              <li>
                <a href="/shop?category=pants" className="hover:text-black transition-colors">
                  Vintage Washed Denim & Cargo
                </a>
              </li>
              <li>
                <a href="/shop?category=polo" className="hover:text-black transition-colors">
                  Heavy Pique Cotton Polo
                </a>
              </li>
              <li>
                <a href="/shop?newArrival=true" className="hover:text-black transition-colors">
                  Latest Drops (New Arrivals)
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Help & Orders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-4">
              Help & Orders
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-600 font-medium">
              <li>
                <a href="/track" className="hover:text-black transition-colors">
                  Track Your Parcel
                </a>
              </li>
              <li>
                <button onClick={openSupport} className="hover:text-black transition-colors text-left">
                  Customer Support AI
                </button>
              </li>
              <li>
                <a href="/shop?offer=true" className="hover:text-black transition-colors">
                  Special Promotions
                </a>
              </li>
              <li>
                <span className="text-neutral-400">Banani 11, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Bangladesh Payment Methods & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-4">
              Accepted Payments
            </h4>
            <p className="text-xs text-neutral-600 mb-3">
              Fast, verified Bangladesh payment methods:
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-neutral-800">
              <span className="px-3 py-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
                Cash on Delivery
              </span>
              <span className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg border border-pink-200">
                bKash
              </span>
              <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                Nagad
              </span>
            </div>
            <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500">
              🔒 100% Guest Ordering — No mandatory account creation or password required.
            </div>
          </div>
        </div>

        {/* Bottom copyright & Developer credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {currentYear} RAW BY ZIFAT. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://sayeemdev69.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 hover:text-black font-bold hover:underline flex items-center gap-1.5"
            >
              <span>Built by SYM_DEV</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 font-mono">
                sayeemdev69.netlify.app
              </span>
            </a>
            <a
              href="https://wa.me/8801752714034"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>01752714034</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
