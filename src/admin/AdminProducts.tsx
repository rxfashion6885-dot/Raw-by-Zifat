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
  Upload,
  Image as ImageIcon,
  Layers,
  Star,
  Loader2,
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
  const [formTiktokReview, setFormTiktokReview] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [formCodAvailable, setFormCodAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsOffer, setFormIsOffer] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Direct Image Upload State (3-4 images from device)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [singleUrlInput, setSingleUrlInput] = useState('');

  // Dynamic Category Creation State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

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

  // Compression helper to keep image sizes ultra-clean & fast
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const fileList = Array.from(files);
      const compressedList = await Promise.all(fileList.map(compressImage));
      const validImages = compressedList.filter((str) => str && str.length > 0);

      if (validImages.length > 0) {
        setProductImages((prev) => [...prev, ...validImages]);
        showToast(`সফলভাবে ${validImages.length}টি ছবি যোগ করা হয়েছে!`, 'success');
      }
    } catch {
      showToast('ছবি আপলোড করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
    showToast('ছবি মুছে ফেলা হয়েছে', 'info');
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    setProductImages((prev) => {
      const updated = [...prev];
      const [chosen] = updated.splice(index, 1);
      updated.unshift(chosen);
      return updated;
    });
    showToast('প্রধান কভার ছবি নির্ধারণ করা হয়েছে', 'success');
  };

  const handleAddImageUrl = () => {
    if (!singleUrlInput.trim()) return;
    setProductImages((prev) => [...prev, singleUrlInput.trim()]);
    setSingleUrlInput('');
    setShowUrlInput(false);
    showToast('লিংক থেকে ছবি যোগ করা হয়েছে', 'success');
  };

  const handleQuickCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showToast('ক্যাটাগরির নাম লিখুন', 'error');
      return;
    }

    setIsSavingCategory(true);
    try {
      const slug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newCat = await api.adminCreateCategory({
        name: trimmed,
        slug: slug || `cat-${Date.now()}`,
        description: `${trimmed} collection`,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        displayOrder: categories.length + 1,
      });

      setCategories((prev) => [...prev, newCat]);
      setFormCategoryId(newCat.id);
      setNewCategoryName('');
      setIsAddingNewCategory(false);
      showToast(`নতুন ক্যাটাগরি "${newCat.name}" সফলভাবে যুক্ত হয়েছে!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'ক্যাটাগরি তৈরি ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

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
    setProductImages([]);
    setShowUrlInput(false);
    setSingleUrlInput('');
    setIsAddingNewCategory(false);
    setFormTiktokReview('');
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
    setProductImages(p.images && p.images.length > 0 ? p.images : []);
    setShowUrlInput(false);
    setSingleUrlInput('');
    setIsAddingNewCategory(false);
    setFormTiktokReview(p.tiktokReviewUrl || '');
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
      showToast('নাম এবং মূল্য অবশ্যই পূরণ করতে হবে', 'error');
      return;
    }

    if (productImages.length === 0) {
      showToast('অনুগ্রহ করে পণ্যের অন্তত ১টি ছবি আপলোড করুন (৩-৪টি ছবি দেওয়া উত্তম)', 'error');
      return;
    }

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
      images: productImages,
      thumbnail: productImages[0],
      sizes: formSizes,
      colors: [
        { name: 'Onyx Black', hex: '#111111' },
        { name: 'Chalk White', hex: '#FFFFFF' },
      ],
      codAvailable: formCodAvailable,
      tiktokReviewUrl: formTiktokReview.trim() || undefined,
      isFeatured: formIsFeatured,
      isNewArrival: formIsNewArrival,
      isBestSeller: formIsBestSeller,
      isOffer: formIsOffer,
      isPublished: formIsPublished,
    };

    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, payload);
        showToast(`পোশাক "${formName}" সফলভাবে আপডেট হয়েছে`, 'success');
      } else {
        await api.adminCreateProduct(payload);
        showToast(`পোশাক "${formName}" সফলভাবে তৈরি হয়েছে`, 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'পণ্য সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      ক্যাটাগরি নির্বাচন (Category) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                      className="text-[11px] font-bold text-neutral-900 hover:text-black underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>{isAddingNewCategory ? 'বন্ধ করুন' : '+ নতুন ক্যাটাগরি'}</span>
                    </button>
                  </div>

                  <select
                    value={formCategoryId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddingNewCategory(true);
                      } else {
                        setFormCategoryId(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-black"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-extrabold text-amber-700 bg-amber-50">
                      ➕ + Add New Category (+ নতুন ক্যাটাগরি যোগ করুন)
                    </option>
                  </select>

                  {/* Inline Add New Category Box */}
                  {isAddingNewCategory && (
                    <div className="mt-2.5 p-3.5 bg-neutral-100 rounded-2xl border border-neutral-300 space-y-2.5 animate-fade-in shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-neutral-700" />
                          নতুন ক্যাটাগরি যোগ করুন (Add New Category)
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCategory(false)}
                          className="p-1 text-neutral-400 hover:text-black rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="ক্যাটাগরির নাম লিখুন (যেমন: Polo Shirt, Denim Jeans, Panjabi)..."
                          className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-black"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickCreateCategory();
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isSavingCategory || !newCategoryName.trim()}
                            onClick={handleQuickCreateCategory}
                            className="px-4 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            {isSavingCategory ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>যোগ করুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewCategory(false)}
                            className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl shrink-0"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* DIRECT MULTI-IMAGE UPLOAD (NO IMAGE LINK REQUIRED - 3-4 IMAGES DIRECTLY FROM DEVICE) */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-neutral-700" />
                        পণ্যের ছবি সরাসরি আপলোড (Direct Image Upload) *
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        কোনো ইমেজ লিংকের প্রয়োজন নেই। আপনার ফোন বা কম্পিউটার থেকে সরাসরি ৩-৪টি ছবি আপলোড করুন।
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>ছবি আপলোড করুন (৩-৪টি)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultipleFileUpload}
                          className="hidden"
                          disabled={isUploadingImages}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] text-neutral-600 hover:text-black underline px-2 py-1"
                      >
                        {showUrlInput ? 'লিংক ইনপুট বন্ধ' : '+ লিংক দিয়ে যোগ'}
                      </button>
                    </div>
                  </div>

                  {/* Uploading progress indicator */}
                  {isUploadingImages && (
                    <div className="flex items-center gap-2.5 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-semibold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                      <span>ছবিসমূহ কম্প্রেস ও আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                    </div>
                  )}

                  {/* Optional URL input if needed */}
                  {showUrlInput && (
                    <div className="flex gap-2 p-3 bg-white rounded-xl border border-neutral-200 animate-fade-in">
                      <input
                        type="url"
                        value={singleUrlInput}
                        onChange={(e) => setSingleUrlInput(e.target.value)}
                        placeholder="ইমেজ লিংক পেস্ট করুন (যেমন: https://...)..."
                        className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-black"
                      >
                        যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* Display uploaded images thumbnail grid */}
                  {productImages.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                        <span>
                          মোট <strong className="text-black">{productImages.length}টি</strong> ছবি যুক্ত আছে
                          {productImages.length >= 3 && ' (৩-৪টি ছবি সম্পন্ন হয়েছে)'}
                        </span>
                        <span className="text-neutral-400">প্রথম ছবিটি প্রধান কভার (Cover) হিসেবে প্রদর্শিত হবে</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {productImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-neutral-100 shadow-xs transition-all ${
                              idx === 0 ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-neutral-200'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Product preview ${idx + 1}`}
                              className="w-full h-full object-cover object-center"
                            />

                            {/* Badge indicator */}
                            <div className="absolute top-1.5 left-1.5 z-10">
                              {idx === 0 ? (
                                <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-xs flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>প্রধান কভার</span>
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-neutral-900/80 text-white text-[9px] font-bold rounded-md shadow-xs backdrop-blur-xs">
                                  #{idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Action overlays */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMakePrimary(idx)}
                                  title="প্রধান ছবি বানান (Make Cover)"
                                  className="p-1.5 bg-white text-neutral-900 hover:bg-emerald-500 hover:text-white rounded-lg shadow-md transition-colors text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" />
                                  <span className="hidden sm:inline">কভার</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                title="ছবি মুছে ফেলুন"
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Quick Add More Card */}
                        <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 transition-all flex flex-col items-center justify-center p-3 text-center group">
                          <Upload className="w-6 h-6 text-neutral-400 group-hover:text-black mb-1 transition-colors" />
                          <span className="text-[11px] font-bold text-neutral-700 group-hover:text-black">
                            + আরও ছবি
                          </span>
                          <span className="text-[9px] text-neutral-400">ডিভাইস থেকে</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleFileUpload}
                            className="hidden"
                            disabled={isUploadingImages}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* Empty Upload State Card */
                    <label className="cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl p-6 bg-white hover:bg-neutral-50/80 transition-all flex flex-col items-center justify-center text-center group">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center mb-2 transition-colors">
                        <Upload className="w-6 h-6 text-neutral-700 group-hover:text-black" />
                      </div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        ক্লিক করে ডিভাইস থেকে ৩-৪টি ছবি একসাথে নির্বাচন করুন
                      </span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        PNG, JPG, WEBP ফরম্যাট সমর্থিত (কোনো লিংক দিতে হবে না)
                      </span>
                      <span className="inline-block mt-3 px-4 py-1.5 bg-neutral-900 group-hover:bg-black text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors">
                        ফাইল বা গ্যালারি থেকে বাছুন
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleFileUpload}
                        className="hidden"
                        disabled={isUploadingImages}
                      />
                    </label>
                  )}
                </div>

                {/* TikTok Review Video URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    TikTok Review Video Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formTiktokReview}
                    onChange={(e) => setFormTiktokReview(e.target.value)}
                    placeholder="https://www.tiktok.com/@rawbyzifat/video/... (customers will see review video)"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-hidden"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    If provided, customers can watch the TikTok video review directly on the product details page.
                  </p>
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
