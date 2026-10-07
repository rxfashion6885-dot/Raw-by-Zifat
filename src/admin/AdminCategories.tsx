import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { Category } from '../types/index.js';
import { Plus, Edit2, Trash2, X, Layers } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast, refreshSettings } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');

  const fetchCats = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setDisplayOrder((categories.length + 1).toString());
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description);
    setImage(c.image);
    setDisplayOrder(c.displayOrder.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<Category> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      image: image.trim(),
      displayOrder: parseInt(displayOrder) || 1,
    };

    try {
      if (editingCategory) {
        await api.adminUpdateCategory(editingCategory.id, payload);
        showToast('Category updated', 'success');
      } else {
        await api.adminCreateCategory(payload);
        showToast('Category created', 'success');
      }
      setIsModalOpen(false);
      fetchCats();
      refreshSettings();
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.adminDeleteCategory(id);
      showToast('Category deleted', 'success');
      fetchCats();
      refreshSettings();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  return (
    <AdminLayout activeTab="categories">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              STORE ORGANIZATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Clothing Categories
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="aspect-16/9 bg-neutral-100 overflow-hidden relative">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/75 text-white text-[10px] font-bold rounded">
                  Order: #{c.displayOrder}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-neutral-950 uppercase">{c.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">slug: {c.slug}</p>
                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">
                    {c.productCount || 0} Products
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base uppercase text-neutral-950">
                {editingCategory ? 'Edit Category' : 'New Clothing Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oversized"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. oversized"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-100 rounded-xl text-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
