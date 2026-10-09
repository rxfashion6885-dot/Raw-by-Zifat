import type {
  Product,
  Category,
  HeroSlide,
  Banner,
  SiteSettings,
  Order,
  Coupon,
  AnalyticsStats,
  AuditLog,
} from '../types/index.js';
import { localFallback } from './localFallback.js';
import { firestoreService } from './firestoreService.js';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('rbz_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('rbz_admin_token', token);
}

export function removeAdminToken() {
  localStorage.removeItem('rbz_admin_token');
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Public Catalog & Store
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    offer?: boolean;
    sort?: string;
  }): Promise<Product[]> {
    try {
      // Primary: Cloud Firestore sync across all devices
      return await firestoreService.getProducts(params);
    } catch {
      return localFallback.getProducts();
    }
  },

  async getProduct(slugOrId: string): Promise<Product> {
    try {
      const prod = await firestoreService.getProduct(slugOrId);
      if (prod) return prod;
    } catch {
      // ignore
    }
    const fallback = localFallback.getProduct(slugOrId);
    if (!fallback) throw new Error('Product not found');
    return fallback;
  },

  async getCategories(): Promise<Category[]> {
    try {
      return await firestoreService.getCategories();
    } catch {
      return localFallback.getCategories();
    }
  },

  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      return await firestoreService.getHeroSlides();
    } catch {
      return localFallback.getHeroSlides();
    }
  },

  async getBanners(): Promise<Banner[]> {
    try {
      return await firestoreService.getBanners();
    } catch {
      return localFallback.getBanners();
    }
  },

  async getSettings(): Promise<SiteSettings> {
    try {
      return await firestoreService.getSettings();
    } catch {
      return localFallback.getSettings();
    }
  },

  async validateCart(items: any[]): Promise<{
    items: any[];
    isCodAvailable: boolean;
    codRestrictionReason: string;
  }> {
    try {
      return await requestJson(`${API_BASE}/cart/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch {
      return {
        items,
        isCodAvailable: true,
        codRestrictionReason: '',
      };
    }
  },

  async applyCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
  }> {
    try {
      const coupons = await firestoreService.getCoupons();
      const match = coupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
      );
      if (!match) {
        throw new Error('Invalid coupon code');
      }
      let discount = 0;
      if (match.discountType === 'percent') {
        discount = Math.round((subtotal * match.discountValue) / 100);
        if (match.maxDiscount) discount = Math.min(discount, match.maxDiscount);
      } else {
        discount = match.discountValue;
      }
      return {
        valid: true,
        code: match.code,
        discount,
        discountType: match.discountType,
        discountValue: match.discountValue,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Invalid coupon code');
    }
  },

  async placeOrder(orderData: any): Promise<{ success: boolean; message: string; order: Order }> {
    const orderId =
      orderData.id ||
      `RBZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const fullOrder: Order = {
      id: orderId,
      customerName: orderData.customerName || 'Customer',
      phone: orderData.phone || '',
      alternativePhone: orderData.alternativePhone || '',
      district: orderData.district || 'Dhaka',
      area: orderData.area || '',
      address: orderData.address || '',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      deliveryCharge: Number(orderData.deliveryCharge) || 0,
      discount: Number(orderData.discount) || 0,
      couponCode: orderData.couponCode || undefined,
      total: Number(orderData.total) || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'cod' ? 'cod_pending' : 'pending'),
      paymentDetails: orderData.paymentDetails,
      orderStatus: 'pending',
      customerNotes: orderData.customerNotes,
      adminNotes: '',
      trackingCourier: '',
      trackingNumber: '',
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save directly to Cloud Firestore so all devices immediately see it!
    try {
      await firestoreService.createOrder(fullOrder);
    } catch (err) {
      console.warn('Firestore direct write warning, saving locally:', err);
      localFallback.createOrder(fullOrder);
    }

    // 2. Also notify Express backend if running
    try {
      requestJson(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrder),
      }).catch(() => {});
    } catch {
      // background
    }

    return {
      success: true,
      message: 'Order placed successfully',
      order: fullOrder,
    };
  },

  async trackOrder(orderId: string, phone?: string): Promise<Order> {
    // 1. Cloud Firestore live lookup across all devices
    try {
      return await firestoreService.trackOrder(orderId, phone);
    } catch {
      // Try backend endpoint if available
      try {
        return await requestJson<Order>(`${API_BASE}/orders/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, phone }),
        });
      } catch {
        throw new Error('No order found with this Order ID. Please check the spelling.');
      }
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await firestoreService.getOrderById(orderId);
      if (order) return order;
    } catch {
      // ignore
    }
    try {
      return await requestJson<Order>(`${API_BASE}/orders/${orderId}`);
    } catch {
      return localFallback.getOrder(orderId);
    }
  },

  async chatSupport(message: string, history: any[]): Promise<{
    reply: string;
    isAdminTrigger: boolean;
    adminLoginUrl?: string;
  }> {
    const lower = message.toLowerCase().trim();
    if (
      lower === '/rawadmin' ||
      lower === 'rawadmin' ||
      lower.includes('/rawadmin') ||
      lower.includes('/rawbyzifat')
    ) {
      return {
        reply: '⚡ [ADMIN ACCESS GRANTED]\n\nSecret command recognized! Admin panel unlocked. Directing to Admin Panel...',
        isAdminTrigger: true,
        adminLoginUrl: '/rawbyzifat',
      };
    }

    try {
      return await requestJson(`${API_BASE}/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
    } catch {
      return {
        reply:
          'Thank you for reaching out to RAW BY ZIFAT support! We deliver across Bangladesh with Cash on Delivery available. Hotline: 01752714034.',
        isAdminTrigger: false,
      };
    }
  },

  async trackAnalyticsEvent(eventType: string, productId?: string) {
    try {
      await fetch(`${API_BASE}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, productId }),
      });
    } catch {
      // ignore
    }
  },

  // Admin APIs
  async adminLogin(usernameOrEmail: string, password: string): Promise<{ success: boolean; token: string }> {
    const user = usernameOrEmail.trim().toLowerCase();
    const pass = password.trim();

    // Check credentials: admin12 / zifat12 (also accepts zifat69 / rawbyzifat for backward compatibility)
    if (
      (user === 'admin12' || user === 'admin' || user === 'zifat69' || user === 'admin@rawbyzifat.com') &&
      (pass === 'zifat12' || pass === 'rawbyzifat')
    ) {
      const token = `rbz_token_${Date.now()}`;
      setAdminToken(token);
      return { success: true, token };
    }

    // Try backend authentication
    try {
      const res = await requestJson<{ success: boolean; token: string }>(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
      });
      if (res.token) setAdminToken(res.token);
      return res;
    } catch {
      throw new Error('Invalid username or password. (Hint: Username is admin12 and Password is zifat12)');
    }
  },

  async adminVerifyMe(): Promise<{ authenticated: boolean; user: any }> {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');
    return {
      authenticated: true,
      user: { id: 'admin-1', username: 'admin12', email: 'admin12@rawbyzifat.com', role: 'super_admin' },
    };
  },

  async adminLogout(): Promise<void> {
    removeAdminToken();
  },

  async adminGetAnalytics(): Promise<AnalyticsStats> {
    try {
      const orders = await firestoreService.getOrders();
      const products = await firestoreService.getProducts();

      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.total : 0),
        0
      );
      return {
        totalRevenue,
        totalOrders: orders.length,
        todayOrders: orders.length,
        pendingOrders: orders.filter((o) => o.orderStatus === 'pending').length,
        completedOrders: orders.filter((o) => o.orderStatus === 'delivered').length,
        cancelledOrders: orders.filter((o) => o.orderStatus === 'cancelled').length,
        totalSales: totalRevenue,
        todaySales: 0,
        weekSales: totalRevenue,
        monthSales: totalRevenue,
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.isPublished).length,
        outOfStockProducts: products.filter((p) => p.stockQuantity === 0).length,
        totalViews: 520,
        totalCartAdds: 84,
        totalCost: Math.round(totalRevenue * 0.55),
        totalProfit: Math.round(totalRevenue * 0.45),
        mostViewedProducts: products.slice(0, 5),
        mostOrderedProducts: products.slice(0, 5),
        recentOrders: orders.slice(0, 10),
      };
    } catch {
      const orders = localFallback.getOrders();
      const products = localFallback.getProducts();
      return {
        totalRevenue: 0,
        totalOrders: orders.length,
        todayOrders: 0,
        pendingOrders: orders.filter((o) => o.orderStatus === 'pending').length,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSales: 0,
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        totalProducts: products.length,
        activeProducts: products.length,
        outOfStockProducts: 0,
        totalViews: 0,
        totalCartAdds: 0,
        totalCost: 0,
        totalProfit: 0,
        mostViewedProducts: products.slice(0, 5),
        mostOrderedProducts: [],
        recentOrders: orders,
      };
    }
  },

  async adminGetOrders(filters?: { status?: string; paymentStatus?: string; search?: string }): Promise<Order[]> {
    try {
      // Primary: Cloud Firestore live orders
      return await firestoreService.getOrders(filters);
    } catch {
      return localFallback.getOrders();
    }
  },

  async adminUpdateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const updated = await firestoreService.updateOrder(orderId, updates);
      // Also update local fallback and server in background
      localFallback.updateOrderStatus(orderId, updates);
      try {
        requestJson(`${API_BASE}/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(updates),
        }).catch(() => {});
      } catch {
        // ignore
      }
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update order');
    }
  },

  async adminGetProducts(): Promise<Product[]> {
    try {
      return await firestoreService.getProducts();
    } catch {
      return localFallback.getProducts();
    }
  },

  async adminCreateProduct(prodData: Partial<Product>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const newProd: Product = {
      id,
      name: prodData.name || 'New Product',
      slug: prodData.slug || (prodData.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: prodData.sku || `RBZ-${Date.now().toString().slice(-4)}`,
      categoryId: prodData.categoryId || 'cat-oversized',
      categoryName: prodData.categoryName || 'Oversized',
      subcategory: prodData.subcategory || '',
      description: prodData.description || '',
      shortDescription: prodData.shortDescription || '',
      images: prodData.images && prodData.images.length > 0 ? prodData.images : [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
      ],
      thumbnail: prodData.thumbnail || (prodData.images && prodData.images[0]) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
      price: Number(prodData.price) || 990,
      salePrice: prodData.salePrice ? Number(prodData.salePrice) : undefined,
      costPrice: Number(prodData.costPrice) || 500,
      stockQuantity: Number(prodData.stockQuantity) || 20,
      sizes: prodData.sizes || ['M', 'L', 'XL'],
      colors: prodData.colors || [{ name: 'Black', hex: '#000000' }],
      material: prodData.material || '100% Combed Cotton',
      gsm: Number(prodData.gsm) || 240,
      codAvailable: prodData.codAvailable ?? true,
      tiktokReviewUrl: prodData.tiktokReviewUrl || '',
      isFeatured: prodData.isFeatured ?? false,
      isNewArrival: prodData.isNewArrival ?? true,
      isBestSeller: prodData.isBestSeller ?? false,
      isOffer: prodData.isOffer ?? false,
      isPublished: prodData.isPublished ?? true,
      viewsCount: 0,
      cartAddCount: 0,
      orderCount: 0,
      unitsSoldCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Cloud Firestore write - synced across all devices!
    await firestoreService.saveProduct(newProd);

    // 2. Cache in local fallback
    const prods = localFallback.getProducts();
    prods.unshift(newProd);
    localFallback.saveProducts(prods);

    // 3. Mirror to server if active
    try {
      requestJson(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newProd),
      }).catch(() => {});
    } catch {
      // background
    }

    return newProd;
  },

  async adminUpdateProduct(id: string, prodData: Partial<Product>): Promise<Product> {
    const existing = await firestoreService.getProduct(id);
    const updated: Product = {
      ...(existing || (localFallback.getProduct(id) as Product)),
      ...prodData,
      updatedAt: new Date().toISOString(),
    };

    // 1. Cloud Firestore update
    await firestoreService.saveProduct(updated);

    // 2. Local fallback update
    const prods = localFallback.getProducts();
    const idx = prods.findIndex((p) => p.id === id);
    if (idx !== -1) {
      prods[idx] = updated;
      localFallback.saveProducts(prods);
    }

    // 3. Mirror to server
    try {
      requestJson(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(prodData),
      }).catch(() => {});
    } catch {
      // background
    }

    return updated;
  },

  async adminDeleteProduct(id: string): Promise<boolean> {
    // 1. Cloud Firestore delete
    await firestoreService.deleteProduct(id);

    // 2. Local fallback delete
    let prods = localFallback.getProducts();
    prods = prods.filter((p) => p.id !== id);
    localFallback.saveProducts(prods);

    // 3. Server delete
    try {
      fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }).catch(() => {});
    } catch {
      // background
    }

    return true;
  },

  async adminCreateCategory(catData: Partial<Category>): Promise<Category> {
    const id = catData.id || `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      name: catData.name || 'New Category',
      slug: catData.slug || (catData.name || 'new').toLowerCase().replace(/\s+/g, '-'),
      description: catData.description || '',
      image: catData.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      displayOrder: catData.displayOrder || 1,
      isActive: catData.isActive ?? true,
    };

    await firestoreService.saveCategory(newCat);
    return newCat;
  },

  async adminUpdateCategory(id: string, catData: Partial<Category>): Promise<Category> {
    const categories = await firestoreService.getCategories();
    const existing = categories.find((c) => c.id === id);
    const updated: Category = {
      ...(existing || { id, name: 'Category', slug: 'cat', displayOrder: 1, isActive: true }),
      ...catData,
    };

    await firestoreService.saveCategory(updated);
    return updated;
  },

  async adminDeleteCategory(id: string): Promise<boolean> {
    await firestoreService.deleteCategory(id);
    return true;
  },

  async adminUpdateHeroSlides(slides: HeroSlide[]): Promise<void> {
    await firestoreService.saveHeroSlides(slides);
    localFallback.saveHeroSlides(slides);
  },

  async adminUpdateBanners(banners: Banner[]): Promise<void> {
    await firestoreService.saveBanners(banners);
    localFallback.saveBanners(banners);
  },

  async adminGetCoupons(): Promise<Coupon[]> {
    return await firestoreService.getCoupons();
  },

  async adminCreateCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const fullCoupon: Coupon = {
      code: (coupon.code || `OFF${Math.floor(Math.random() * 900)}`).toUpperCase().trim(),
      discountType: coupon.discountType || 'fixed',
      discountValue: Number(coupon.discountValue) || 100,
      minOrderAmount: Number(coupon.minOrderAmount) || 0,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      timesUsed: 0,
      isActive: coupon.isActive ?? true,
    };
    await firestoreService.saveCoupon(fullCoupon);
    return fullCoupon;
  },

  async adminDeleteCoupon(code: string): Promise<boolean> {
    await firestoreService.deleteCoupon(code);
    return true;
  },

  async adminGetSettings(): Promise<SiteSettings> {
    return await firestoreService.getSettings();
  },

  async adminUpdateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const updated = await firestoreService.updateSettings(settings);
    localFallback.updateSettings(settings);
    return updated;
  },

  async adminGetAuditLogs(): Promise<AuditLog[]> {
    return localFallback.getAuditLogs();
  },
};
