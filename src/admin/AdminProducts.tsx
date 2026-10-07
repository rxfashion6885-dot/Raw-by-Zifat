import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';
import type { Product, Category } from '../types/index.js';
import {
  Plus,
  Edit2,
  Trash2,
  Share2,
  Check,
  Search,
  ExternalLink,
  X,
  AlertTriangle,
  Banknote,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formMaterial, setFormMaterial] = useState('100% Combed Cotton');
  const [formGsm, setFormGsm] = useState('240');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [formCodAvailable, setFormCodAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsOffer, setFormIsOffer] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([api.adminGetProducts(), api.getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormSku(`RBZ-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategoryId(categories[0]?.id || 'cat-oversized');
    setFormPrice('950');
    setFormSalePrice('');
    setFormCostPrice('500');
    setFormStock('25');
    setFormMaterial('100% Combed Cotton');
    setFormGsm('240');
    setFormDescription('Crafted with premium organic yarn and high-density stitching.');
    setFormShortDescription('Minimalist contemporary streetwear piece.');
    setFormImages('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85');
    setFormSizes(['M', 'L', 'XL', 'XXL']);
    setFormCodAvailable(true);
    setFormIsFeatured(true);
    setFormIsNewArrival(true);
    setFormIsBestSeller(false);
    setFormIsOffer(false);
    setFormIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormSku(p.sku);
    setFormCategoryId(p.categoryId);
    setFormPrice(p.price.toString());
    setFormSalePrice(p.salePrice ? p.salePrice.toString() : '');
    setFormCostPrice(p.costPrice ? p.costPrice.toString() : '');
    setFormStock(p.stockQuantity.toString());
    setFormMaterial(p.material || '');
    setFormGsm(p.gsm ? p.gsm.toString() : '');
    setFormDescription(p.description);
    setFormShortDescription(p.shortDescription);
    setFormImages(p.images.join('\n'));
    setFormSizes(p.sizes);
    setFormCodAvailable(p.codAvailable !== false);
    setFormIsFeatured(p.isFeatured);
    setFormIsNewArrival(p.isNewArrival);
    setFormIsBestSeller(p.isBestSeller);
    setFormIsOffer(p.isOffer);
    setFormIsPublished(p.isPublished);
    setIsModalOpen(true);
  };

  const handleCopyLink = async (slug: string) => {
    const fullUrl = `${window.location.origin}/product/${slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      }
      setCopiedId(slug);
      showToast(`Copied deep link: /product/${slug}`, 'success');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast('Failed to copy deep link', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      showToast('Name and price are required', 'error');
      return;
    }

    const imgArray = formImages
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const categoryObj = categories.find((c) => c.id === formCategoryId);

    const payload: Partial<Product> = {
      name: formName.trim(),
      slug:
        formSlug.trim() ||
        formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      sku: formSku.trim(),
      categoryId: formCategoryId,
      categoryName: categoryObj?.name || 'Apparel',
      price: parseFloat(formPrice),
      salePrice: formSalePrice ? parseFloat(formSalePrice) : undefined,
      costPrice: formCostPrice ? parseFloat(formCostPrice) : undefined,
      stockQuantity: parseInt(formStock) || 0,
      material: formMaterial.trim(),
      gsm: formGsm ? parseInt(formGsm) : undefined,
      description: formDescription.trim(),
      shortDescription: formShortDescription.trim(),
      images: imgArray.length > 0 ? imgArray : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85'],
      thumbnail: imgArray[0] || '',
      sizes: formSizes,
      colors: [
        { name: 'Onyx Black', hex: '#111111' },
        { name: 'Chalk White', hex: '#FFFFFF' },
      ],
      codAvailable: formCodAvailable,
      isFeatured: formIsFeatured,
      isNewArrival: formIsNewArrival,
      isBestSeller: formIsBestSeller,
      isOffer: formIsOffer,
      isPublished: formIsPublished,
    };

    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, payload);
        showToast(`Product "${formName}" updated successfully`, 'success');
      } else {
        await api.adminCreateProduct(payload);
        showToast(`Product "${formName}" created successfully`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.adminDeleteProduct(id);
      showToast(`Product "${name}" deleted`, 'success');
      fetchProducts();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout activeTab="products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              APPAREL INVENTORY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Product Management
            </h1>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Clothing Item</span>
          </button>
        </div>

        {/* Search & Info banner */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-xs font-semibold text-neutral-500">
            Total {products.length} clothing items in catalog
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold uppercase tracking-wider text-neutral-400">
              Loading Inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-400">
              No clothing products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">SKU / Category</th>
                    <th className="py-3.5 px-4">Price / Cost</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Cash on Delivery</th>
                    <th className="py-3.5 px-4">Performance</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map((p) => {
                    const profitPerUnit = p.costPrice
                      ? (p.salePrice || p.price) - p.costPrice
                      : null;

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.thumbnail || p.images[0]}
                              alt={p.name}
                              className="w-12 h-14 object-cover rounded-xl bg-neutral-100 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-neutral-900 block line-clamp-1">
                                {p.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {p.isPublished ? (
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                    Published
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-semibold">
                                    Draft
                                  </span>
                                )}
                                {p.gsm && (
                                  <span className="text-[10px] text-neutral-400">
                                    {p.gsm} GSM
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-neutral-900 block">{p.sku}</span>
                          <span className="text-neutral-400 text-[11px]">{p.categoryName}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-extrabold text-neutral-950 block">
                            ৳{(p.salePrice || p.price).toLocaleString()}
                          </span>
                          {profitPerUnit !== null ? (
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              Profit: ৳{profitPerUnit} / unit
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 block">
                              Cost: N/A
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`font-bold ${
                              p.stockQuantity <= 5 ? 'text-rose-600' : 'text-neutral-900'
                            }`}
                          >
                            {p.stockQuantity} units
                          </span>
                        </td>

                        {/* PRODUCT-SPECIFIC CASH ON DELIVERY COLUMN */}
                        <td className="py-4 px-4">
                          {p.codAvailable ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              COD ON
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                              COD OFF (Prepaid)
                            </span>
                          )}
                        </td>

                        {/* Real Performance Metrics */}
                        <td className="py-4 px-4 text-[11px]">
                          <span className="text-neutral-700 font-semibold block">
                            {p.viewsCount || 0} views • {p.cartAddCount || 0} carts
                          </span>
                          <span className="text-emerald-700 font-bold block">
                            {p.unitsSoldCount || 0} sold (৳{(p.revenue || 0).toLocaleString()})
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy direct URL button for social marketing */}
                            <button
                              onClick={() => handleCopyLink(p.slug)}
                              title="Copy Deep Link for FB/TikTok/WhatsApp"
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                            >
                              {copiedId === p.slug ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit product"
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              title="Delete product"
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                {editingProduct ? 'Edit Clothing Item' : 'Add New Apparel Piece'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Heavyweight Minimal Drop-Shoulder Tee"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Slug (Deep Link URL)
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. heavyweight-drop-shoulder-tee"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. RBZ-OVS-009"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                {/* Pricing & Profit tracking */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Regular Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="850"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Sale Discount Price (Optional BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    placeholder="750"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Garment Cost Price (BDT ৳) - For Profit Tracking
                  </label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="450"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    GSM Fabric Weight
                  </label>
                  <input
                    type="number"
                    value={formGsm}
                    onChange={(e) => setFormGsm(e.target.value)}
                    placeholder="260"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Fabric / Material Composition
                  </label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="100% Combed Compact Cotton"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                {/* CASH ON DELIVERY TOGGLE (CRITICAL REQUIREMENT) */}
                <div className="sm:col-span-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                        Cash on Delivery (COD) Control
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Enable or disable Cash on Delivery specifically for this clothing product.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formCodAvailable}
                        onChange={(e) => setFormCodAvailable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Image URLs (One URL per line) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Garment Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-hidden resize-none"
                  />
                </div>

                {/* Badges Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 text-xs font-semibold pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsNewArrival}
                      onChange={(e) => setFormIsNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsOffer}
                      onChange={(e) => setFormIsOffer(e.target.checked)}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>Special Offer</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-black"
                    />
                    <span>Published in Store</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
