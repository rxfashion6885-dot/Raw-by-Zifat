import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase.js';
import type {
  Product,
  Category,
  HeroSlide,
  Banner,
  SiteSettings,
  Order,
  Coupon,
  AuditLog,
} from '../types/index.js';
import { localFallback } from './localFallback.js';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Warning/Error: ', JSON.stringify(errInfo));
}

let isInitialized = false;

export const firestoreService = {
  /**
   * Initializes Firestore with default seed data if collections are empty.
   */
  async ensureSeedData(): Promise<void> {
    if (isInitialized) return;
    isInitialized = true;

    try {
      // 1. Check products
      const prodCol = collection(db, 'products');
      const prodSnap = await getDocs(query(prodCol, limit(1)));
      if (prodSnap.empty) {
        console.log('Seeding initial products to Firestore...');
        const initialProducts = localFallback.getProducts();
        for (const p of initialProducts) {
          await setDoc(doc(db, 'products', p.id), p);
        }
      }

      // 2. Check categories
      const catCol = collection(db, 'categories');
      const catSnap = await getDocs(query(catCol, limit(1)));
      if (catSnap.empty) {
        console.log('Seeding initial categories to Firestore...');
        const initialCategories = localFallback.getCategories();
        for (const c of initialCategories) {
          await setDoc(doc(db, 'categories', c.id), c);
        }
      }

      // 3. Check settings
      const settingsRef = doc(db, 'settings', 'store');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        console.log('Seeding store settings to Firestore...');
        const initialSettings = localFallback.getSettings();
        await setDoc(settingsRef, initialSettings);
      }

      // 4. Check hero slides
      const slidesRef = doc(db, 'settings', 'heroSlides');
      const slidesSnap = await getDoc(slidesRef);
      if (!slidesSnap.exists()) {
        const initialSlides = localFallback.getHeroSlides();
        await setDoc(slidesRef, { slides: initialSlides });
      }

      // 5. Check coupons
      const couponsCol = collection(db, 'coupons');
      const couponsSnap = await getDocs(query(couponsCol, limit(1)));
      if (couponsSnap.empty) {
        const initialCoupons = localFallback.getCoupons();
        for (const cp of initialCoupons) {
          await setDoc(doc(db, 'coupons', cp.code.toUpperCase()), cp);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    }
  },

  // --- PRODUCTS ---
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
      await this.ensureSeedData();
      const snap = await getDocs(collection(db, 'products'));
      let list: Product[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Product);
      });

      if (list.length === 0) {
        list = localFallback.getProducts();
      }

      // Apply in-memory filters for flexibility
      if (params?.category) {
        const cLower = params.category.toLowerCase();
        list = list.filter(
          (p) =>
            p.categoryId?.toLowerCase() === cLower ||
            p.categoryName?.toLowerCase() === cLower
        );
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q)
        );
      }
      if (params?.featured) list = list.filter((p) => p.isFeatured);
      if (params?.newArrival) list = list.filter((p) => p.isNewArrival);
      if (params?.bestSeller) list = list.filter((p) => p.isBestSeller);
      if (params?.offer) list = list.filter((p) => p.isOffer);

      // Sorting
      if (params?.sort === 'price-low') {
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      } else if (params?.sort === 'price-high') {
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      } else if (params?.sort === 'popular') {
        list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else {
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }

      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
      return localFallback.getProducts();
    }
  },

  async getProduct(slugOrId: string): Promise<Product | null> {
    try {
      await this.ensureSeedData();
      // Try direct ID lookup
      const docRef = doc(db, 'products', slugOrId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Product;
      }

      // Lookup by slug or id scan
      const colSnap = await getDocs(collection(db, 'products'));
      let found: Product | null = null;
      colSnap.forEach((d) => {
        const p = d.data() as Product;
        if (p.id === slugOrId || p.slug === slugOrId) {
          found = p;
        }
      });
      if (found) return found;

      return localFallback.getProduct(slugOrId);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `products/${slugOrId}`);
      return localFallback.getProduct(slugOrId);
    }
  },

  async saveProduct(product: Product): Promise<Product> {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      return product;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
      throw err;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      throw err;
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    try {
      await this.ensureSeedData();
      const snap = await getDocs(collection(db, 'categories'));
      const list: Category[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Category);
      });
      if (list.length === 0) {
        return localFallback.getCategories();
      }
      return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'categories');
      return localFallback.getCategories();
    }
  },

  async saveCategory(category: Category): Promise<Category> {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
      return category;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
      throw err;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      throw err;
    }
  },

  // --- ORDERS ---
  async createOrder(order: Order): Promise<Order> {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      console.log(`✓ Order ${order.id} saved to Cloud Firestore`);
      return order;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
      // Fallback
      return localFallback.createOrder(order);
    }
  },

  async getOrders(filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      let list: Order[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Order);
      });

      if (filters?.status && filters.status !== 'all') {
        list = list.filter((o) => o.orderStatus === filters.status);
      }
      if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
        list = list.filter((o) => o.paymentStatus === filters.paymentStatus);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            (o.paymentDetails?.transactionId &&
              o.paymentDetails.transactionId.toLowerCase().includes(q))
        );
      }

      // Sort newest first
      return list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      return localFallback.getOrders();
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const cleanId = orderId.trim();
      // Try direct doc read
      const docRef = doc(db, 'orders', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Order;
      }

      // If exact ID casing differed, search collection
      const snapAll = await getDocs(collection(db, 'orders'));
      let found: Order | null = null;
      snapAll.forEach((d) => {
        const o = d.data() as Order;
        if (o.id.toLowerCase() === cleanId.toLowerCase()) {
          found = o;
        }
      });
      if (found) return found;

      return localFallback.getOrder(cleanId);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
      return localFallback.getOrder(orderId);
    }
  },

  async trackOrder(orderId: string, phone?: string): Promise<Order> {
    try {
      const cleanId = orderId.trim().toLowerCase();
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

      // Query all orders or direct lookup
      const snapAll = await getDocs(collection(db, 'orders'));
      let matchedOrder: Order | null = null;

      snapAll.forEach((d) => {
        const o = d.data() as Order;
        const matchesId = o.id.toLowerCase() === cleanId;
        if (matchesId) {
          if (!cleanPhone) {
            matchedOrder = o;
          } else {
            const oPhone = o.phone.replace(/[^0-9]/g, '');
            // Match last 10 digits to handle country code (+880 vs 01)
            const o10 = oPhone.slice(-10);
            const input10 = cleanPhone.slice(-10);
            if (o10 === input10 || oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone)) {
              matchedOrder = o;
            }
          }
        }
      });

      if (matchedOrder) return matchedOrder;

      // If not in firestore, check local fallback
      const localOrders = localFallback.getOrders();
      const localMatch = localOrders.find((o) => {
        const matchesId = o.id.toLowerCase() === cleanId;
        if (!cleanPhone) return matchesId;
        const oPhone = o.phone.replace(/[^0-9]/g, '');
        return matchesId && (oPhone.slice(-10) === cleanPhone.slice(-10));
      });

      if (localMatch) return localMatch;

      throw new Error(
        'No order found matching this Order ID. Please check the spelling or verify your details.'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, `orders/track/${orderId}`);
      throw err;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error('Order not found');

      const updated: Order = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'orders', order.id), updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      return localFallback.updateOrderStatus(orderId, updates);
    }
  },

  // --- SETTINGS ---
  async getSettings(): Promise<SiteSettings> {
    try {
      await this.ensureSeedData();
      const snap = await getDoc(doc(db, 'settings', 'store'));
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
      return localFallback.getSettings();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/store');
      return localFallback.getSettings();
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await setDoc(doc(db, 'settings', 'store'), updated);
      return updated;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/store');
      return localFallback.updateSettings(settings);
    }
  },

  // --- HERO SLIDES ---
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      await this.ensureSeedData();
      const snap = await getDoc(doc(db, 'settings', 'heroSlides'));
      if (snap.exists() && snap.data()?.slides) {
        return snap.data()?.slides as HeroSlide[];
      }
      return localFallback.getHeroSlides();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/heroSlides');
      return localFallback.getHeroSlides();
    }
  },

  async saveHeroSlides(slides: HeroSlide[]): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'heroSlides'), { slides });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/heroSlides');
    }
  },

  // --- BANNERS ---
  async getBanners(): Promise<Banner[]> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'banners'));
      if (snap.exists() && snap.data()?.banners) {
        return snap.data()?.banners as Banner[];
      }
      return localFallback.getBanners();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/banners');
      return localFallback.getBanners();
    }
  },

  async saveBanners(banners: Banner[]): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'banners'), { banners });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/banners');
    }
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const list: Coupon[] = [];
      snap.forEach((d) => list.push(d.data() as Coupon));
      if (list.length === 0) return localFallback.getCoupons();
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'coupons');
      return localFallback.getCoupons();
    }
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    try {
      await setDoc(doc(db, 'coupons', coupon.code.toUpperCase()), coupon);
      return coupon;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.code}`);
      throw err;
    }
  },

  async deleteCoupon(code: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${code}`);
      throw err;
    }
  },
};
