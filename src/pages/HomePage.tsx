import React, { useState, useEffect } from 'react';
import type { Product, HeroSlide, Banner, Category } from '../types/index.js';
import { api } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { useStore } from '../context/StoreContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { openSupport, openDevProfile, settings } = useStore();
  const { language, t } = useLanguage();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [slidesData, bannersData, catsData, prodsData] = await Promise.all([
          api.getHeroSlides(),
          api.getBanners(),
          api.getCategories(),
          api.getProducts(),
        ]);
        setSlides(slidesData);
        setBanners(bannersData);
        setCategories(catsData);
        setNewArrivals(prodsData.filter((p) => p.isNewArrival).slice(0, 4));
        setBestSellers(prodsData.filter((p) => p.isBestSeller).slice(0, 4));
        setFeaturedProducts(prodsData.filter((p) => p.isFeatured).slice(0, 4));
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Slide autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const midBanner = banners.find((b) => b.position === 'mid');
  const offerBanner = banners.find((b) => b.position === 'offer');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[520px] sm:h-[640px] md:h-[720px] overflow-hidden bg-neutral-950">
        {slides.length > 0 ? (
          slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Picture with responsive art direction */}
              <picture>
                <source media="(max-width: 640px)" srcSet={slide.mobileImage || slide.desktopImage} />
                <img
                  src={slide.desktopImage}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center brightness-[0.7]"
                />
              </picture>

              {/* Text Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex items-end sm:items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full pb-16 sm:pb-0">
                  <div className="max-w-2xl text-white space-y-4">
                    <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20">
                      RAW BY ZIFAT // APPAREL
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-none text-white drop-shadow-md">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-300 font-medium max-w-lg leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-4">
                      <a
                        href={slide.buttonLink || '/shop'}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-95"
                      >
                        <span>{slide.buttonText || 'SHOP COLLECTION'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-white text-sm">
            Loading Hero...
          </div>
        )}

        {/* Slider Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              {language === 'bn' ? 'এক্সক্লুসিভ কালেকশন' : 'CURATED SILHOUETTES'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
              {t('home.exploreCategories')}
            </h2>
          </div>
          <a
            href="/categories"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'View All Categories'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((cat) => (
            <a
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-base font-extrabold uppercase tracking-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-neutral-300 font-medium line-clamp-1 mt-0.5">
                  {cat.description}
                </span>
                {cat.productCount !== undefined && (
                  <span className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider">
                    {cat.productCount} {language === 'bn' ? 'আইটেম' : 'Items'}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-200/60">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-red-600">
              {language === 'bn' ? 'লেটেস্ট ড্রপস' : 'FRESH DROPS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
              {t('home.newArrivals')}
            </h2>
          </div>
          <a
            href="/shop?newArrival=true"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সব নতুন কালেকশন' : 'See New Drops'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL CRAFTSMANSHIP BANNER (MID-PAGE) */}
      {midBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white min-h-[380px] flex items-center">
            {midBanner.image && (
              <img
                src={midBanner.image}
                alt={midBanner.title}
                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.4]"
              />
            )}
            <div className="relative z-10 p-8 sm:p-14 max-w-xl space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                PHILOSOPHY & TEXTILES
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                {midBanner.title}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                {midBanner.description}
              </p>
              {midBanner.buttonText && (
                <div className="pt-2">
                  <a
                    href={midBanner.buttonLink || '/shop'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    <span>{midBanner.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-200/60">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              {language === 'bn' ? 'জনপ্রিয় পছন্দ' : 'POPULAR CHOICES'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
              {t('home.bestSellers')}
            </h2>
          </div>
          <a
            href="/shop?bestSeller=true"
            className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'Explore All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. SPECIAL PROMOTIONAL OFFER BANNER */}
      {offerBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-neutral-800">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
                PROMOTIONAL DROP
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {offerBanner.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg">
                {offerBanner.description}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-5 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-mono tracking-widest text-white uppercase font-bold">
                CODE: RAW10
              </div>
              <a
                href={offerBanner.buttonLink || '/shop'}
                className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                {offerBanner.buttonText || 'USE COUPON'}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 7. DEVELOPER PROFILE SECTION (SYM_DEV) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-200/60">
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl border border-neutral-800 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
            <div className="relative shrink-0">
              <img
                src={
                  settings?.developerProfile?.photoUrl ||
                  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80'
                }
                alt="SYM_DEV"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl bg-neutral-800"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-neutral-950 rounded-full animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-neutral-950 rounded-full" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  LEAD WEB DEVELOPER & CREATOR
                </span>
                <span className="text-[9px] px-2 py-0.5 bg-neutral-800 text-neutral-300 font-mono rounded">
                  4K CYBER ENGINE
                </span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-wide">
                SYM_DEV
              </h3>
              <p className="text-xs text-neutral-300 max-w-lg leading-relaxed">
                Professional Full-Stack Developer creating high-performance digital flagship solutions. Creator of RAW BY ZIFAT official store.
              </p>
              <a
                href="https://sayeemdev69.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 pt-1"
              >
                <span>Portfolio: sayeemdev69.netlify.app</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
            <a
              href="https://wa.me/8801752714034?text=Hello%20SYM_DEV!%20I%20am%20contacting%20you%20from%20RAW%20BY%20ZIFAT%20official%20store."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <span>WhatsApp (01752714034)</span>
            </a>

            <button
              onClick={openDevProfile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl text-xs font-bold transition-colors border border-neutral-700"
            >
              <UserCheck className="w-4 h-4 text-neutral-400" />
              <span>Full Details</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
