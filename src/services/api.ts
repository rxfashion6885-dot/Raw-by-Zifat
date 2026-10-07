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

export const api = {
  // Public
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    offer?: boolean;
    sort?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.newArrival) query.append('newArrival', 'true');
    if (params?.bestSeller) query.append('bestSeller', 'true');
    if (params?.offer) query.append('offer', 'true');
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(slugOrId: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getHeroSlides(): Promise<HeroSlide[]> {
    const res = await fetch(`${API_BASE}/hero-slides`);
    if (!res.ok) throw new Error('Failed to fetch hero slides');
    return res.json();
  },

  async getBanners(): Promise<Banner[]> {
    const res = await fetch(`${API_BASE}/banners`);
    if (!res.ok) throw new Error('Failed to fetch banners');
    return res.json();
  },

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch store settings');
    return res.json();
  },

  async validateCart(items: any[]): Promise<{
    items: any[];
    isCodAvailable: boolean;
    codRestrictionReason: string;
  }> {
    const res = await fetch(`${API_BASE}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to validate cart');
    return res.json();
  },

  async applyCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
  }> {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to apply coupon');
    return data;
  },

  async placeOrder(orderData: any): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  },

  async trackOrder(orderId: string, phone: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to track order');
    return data;
  },

  async chatSupport(message: string, history: any[]): Promise<{
    reply: string;
    isAdminTrigger: boolean;
    adminLoginUrl?: string;
  }> {
    const res = await fetch(`${API_BASE}/support/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reach support');
    return data;
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

  // Admin
  async adminLogin(usernameOrEmail: string, password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminVerifyMe(): Promise<{ authenticated: boolean; user: any }> {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async adminLogout(): Promise<void> {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
    removeAdminToken();
  },

  async adminGetAnalytics(): Promise<AnalyticsStats> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async adminGetOrders(filters?: { status?: string; paymentStatus?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.paymentStatus) query.append('paymentStatus', filters.paymentStatus);
    if (filters?.search) query.append('search', filters.search);

    const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async adminUpdateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order');
    return data.order;
  },

  async adminGetProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async adminCreateProduct(prodData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(prodData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data;
  },

  async adminUpdateProduct(id: string, prodData: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(prodData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async adminDeleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  },

  async adminCreateCategory(catData: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(catData),
    });
    return res.json();
  },

  async adminUpdateCategory(id: string, catData: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(catData),
    });
    return res.json();
  },

  async adminDeleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },

  async adminUpdateHeroSlides(slides: HeroSlide[]): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/hero-slides`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ slides }),
    });
    if (!res.ok) throw new Error('Failed to update hero slides');
  },

  async adminUpdateBanners(banners: Banner[]): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/banners`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ banners }),
    });
    if (!res.ok) throw new Error('Failed to update banners');
  },

  async adminGetCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async adminCreateCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(coupon),
    });
    return res.json();
  },

  async adminDeleteCoupon(code: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/coupons/${code}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  },

  async adminGetSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async adminUpdateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.settings;
  },

  async adminGetAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: authHeaders(),
    });
    return res.json();
  },
};
