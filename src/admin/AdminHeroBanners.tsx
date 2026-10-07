import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { HeroSlide, Banner } from '../types/index.js';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';

export const AdminHeroBanners: React.FC = () => {
  const { showToast } = useStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Slide Modal
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideModalOpen, setSlideModalOpen] = useState(false);

  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideButtonText, setSlideButtonText] = useState('');
  const [slideButtonLink, setSlideButtonLink] = useState('');
  const [slideDesktopImage, setSlideDesktopImage] = useState('');
  const [slideMobileImage, setSlideMobileImage] = useState('');
  const [slideIsActive, setSlideIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sData, bData] = await Promise.all([api.getHeroSlides(), api.getBanners()]);
      setSlides(sData);
      setBanners(bData);
    } catch {
      showToast('Failed to load hero and banner settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddSlide = () => {
    setEditingSlide(null);
    setSlideTitle('NEW APPAREL COLLECTION');
    setSlideSubtitle('HEAVYWEIGHT ORGANIC COTTON STREETWEAR');
    setSlideButtonText('EXPLORE NOW');
    setSlideButtonLink('/shop');
    setSlideDesktopImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85');
    setSlideMobileImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85');
    setSlideIsActive(true);
    setSlideModalOpen(true);
  };

  const openEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle);
    setSlideButtonText(slide.buttonText);
    setSlideButtonLink(slide.buttonLink);
    setSlideDesktopImage(slide.desktopImage);
    setSlideMobileImage(slide.mobileImage);
    setSlideIsActive(slide.isActive);
    setSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSlides = [...slides];

    if (editingSlide) {
      const idx = updatedSlides.findIndex((s) => s.id === editingSlide.id);
      if (idx > -1) {
        updatedSlides[idx] = {
          ...updatedSlides[idx],
          title: slideTitle.trim(),
          subtitle: slideSubtitle.trim(),
          buttonText: slideButtonText.trim(),
          buttonLink: slideButtonLink.trim(),
          desktopImage: slideDesktopImage.trim(),
          mobileImage: slideMobileImage.trim() || slideDesktopImage.trim(),
          isActive: slideIsActive,
        };
      }
    } else {
      const newSlide: HeroSlide = {
        id: `hero-${Date.now()}`,
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        buttonText: slideButtonText.trim(),
        buttonLink: slideButtonLink.trim(),
        desktopImage: slideDesktopImage.trim(),
        mobileImage: slideMobileImage.trim() || slideDesktopImage.trim(),
        displayOrder: updatedSlides.length + 1,
        isActive: slideIsActive,
      };
      updatedSlides.push(newSlide);
    }

    try {
      await api.adminUpdateHeroSlides(updatedSlides);
      setSlides(updatedSlides);
      setSlideModalOpen(false);
      showToast('Hero slides updated successfully', 'success');
    } catch {
      showToast('Failed to save slides', 'error');
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 1) {
      showToast('At least one hero slide is required', 'error');
      return;
    }
    const updated = slides.filter((s) => s.id !== id);
    try {
      await api.adminUpdateHeroSlides(updated);
      setSlides(updated);
      showToast('Slide deleted', 'success');
    } catch {
      showToast('Failed to delete slide', 'error');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const copy = [...slides];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    copy.forEach((s, i) => (s.displayOrder = i + 1));

    try {
      await api.adminUpdateHeroSlides(copy);
      setSlides(copy);
      showToast('Slide order reordered', 'success');
    } catch {
      showToast('Failed to reorder slides', 'error');
    }
  };

  const handleUpdateBanner = async (idx: number, updates: Partial<Banner>) => {
    const copy = [...banners];
    copy[idx] = { ...copy[idx], ...updates };
    try {
      await api.adminUpdateBanners(copy);
      setBanners(copy);
      showToast('Promotional banner updated', 'success');
    } catch {
      showToast('Failed to update banner', 'error');
    }
  };

  return (
    <AdminLayout activeTab="hero-banners">
      <div className="space-y-10">
        {/* Section 1: Hero Slider Control */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                HOMEPAGE SHOWCASE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
                Hero Slider Management
              </h1>
            </div>
            <button
              onClick={openAddSlide}
              className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="aspect-16/9 bg-neutral-950 relative overflow-hidden">
                  <img
                    src={s.desktopImage}
                    alt={s.title}
                    className="w-full h-full object-cover brightness-[0.7]"
                  />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded w-max">
                      Slide #{idx + 1}
                    </span>
                    <h4 className="text-sm font-extrabold uppercase mt-1 line-clamp-1">{s.title}</h4>
                    <p className="text-[11px] text-neutral-300 line-clamp-1">{s.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">CTA: {s.buttonText}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveSlide(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(idx, 'down')}
                        disabled={idx === slides.length - 1}
                        className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditSlide(s)}
                        className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(s.id)}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Promotional Banners */}
        <div className="space-y-6 pt-6 border-t border-neutral-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              EDITORIAL & NOTIFICATION
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 uppercase tracking-tight">
              Promotional Banners
            </h2>
          </div>

          <div className="space-y-4">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-neutral-100 rounded-md">
                    Position: {b.position.toUpperCase()} BANNER
                  </span>
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={b.isActive}
                      onChange={(e) => handleUpdateBanner(idx, { isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>Active on site</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-neutral-600 mb-1">Banner Title</label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => handleUpdateBanner(idx, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={b.image}
                      onChange={(e) => handleUpdateBanner(idx, { image: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-600 mb-1">Description / Promo Text</label>
                    <textarea
                      rows={2}
                      value={b.description}
                      onChange={(e) => handleUpdateBanner(idx, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Slide Modal */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base uppercase text-neutral-950">
                {editingSlide ? 'Edit Hero Slide' : 'New Hero Slide'}
              </h3>
              <button onClick={() => setSlideModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">Subtitle</label>
                <input
                  type="text"
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 uppercase tracking-wider mb-1">Button Text</label>
                  <input
                    type="text"
                    value={slideButtonText}
                    onChange={(e) => setSlideButtonText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 uppercase tracking-wider mb-1">Button Link</label>
                  <input
                    type="text"
                    value={slideButtonLink}
                    onChange={(e) => setSlideButtonLink(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Desktop Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={slideDesktopImage}
                  onChange={(e) => setSlideDesktopImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Mobile Image URL
                </label>
                <input
                  type="text"
                  value={slideMobileImage}
                  onChange={(e) => setSlideMobileImage(e.target.value)}
                  placeholder="Defaults to desktop image if left blank"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slideIsActive}
                    onChange={(e) => setSlideIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-black"
                  />
                  <span>Active on Homepage</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSlideModalOpen(false)}
                    className="px-4 py-2 bg-neutral-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider"
                  >
                    Save Slide
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
