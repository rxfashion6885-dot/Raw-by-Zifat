import React from 'react';
import { useStore } from '../context/StoreContext.js';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, isLoading } = useStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>RAW BY ZIFAT // CURATED COLLECTIONS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 uppercase tracking-tight">
            Apparel Categories
          </h1>
          <p className="text-sm text-neutral-500 font-medium mt-2 leading-relaxed">
            Explore our discipline of minimal silhouettes, heavyweight cotton drops, and modern artisanal panjabi crafted in Bangladesh.
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-neutral-400 font-bold text-xs uppercase tracking-widest">
            Loading Categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-4/5 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-6 text-white"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108 brightness-[0.75] group-hover:brightness-[0.85]"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-300 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                    COLLECTION
                  </span>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-amber-200 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  
                  <div className="pt-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                    <span className="flex items-center gap-1.5 text-neutral-300 group-hover:text-white transition-colors">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Explore Collection</span>
                    </span>
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Bottom Callout */}
        <div className="mt-16 bg-neutral-950 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-neutral-400">
              DISCOVER FULL CATALOG
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Ready to explore all pieces?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Browse our complete range of hoodies, heavyweight tees, distressed denim, and seasonal festival drops.
            </p>
            <div className="pt-2">
              <a
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-95"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
