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

const STORAGE_KEYS = {
  PRODUCTS: 'rbz_static_products',
  CATEGORIES: 'rbz_static_categories',
  HERO_SLIDES: 'rbz_static_hero_slides',
  BANNERS: 'rbz_static_banners',
  SETTINGS: 'rbz_static_settings',
  COUPONS: 'rbz_static_coupons',
  ORDERS: 'rbz_static_orders',
  AUDIT_LOGS: 'rbz_static_audit_logs',
};

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'RAW BY ZIFAT',
  announcementBar: '⚡ FREE EXPRESS SHIPPING ACROSS BANGLADESH ON ORDERS OVER ৳2,500 // CASH ON DELIVERY AVAILABLE',
  phone: '01752714034',
  email: 'contact@rawbyzifat.com',
  address: 'Road 11, Block D, Banani, Dhaka - 1213, Bangladesh',
  codMode: 'global_enabled',
  paymentSettings: {
    bkash: {
      enabled: true,
      number: '01752714034',
      accountType: 'Personal',
      instructions: 'Send money or make payment to this personal bKash number and enter TrxID.',
    },
    nagad: {
      enabled: true,
      number: '01752714034',
      accountType: 'Personal',
      instructions: 'Send money to this personal Nagad number and enter TrxID.',
    },
  },
  deliverySettings: {
    insideDhakaCharge: 60,
    outsideDhakaCharge: 120,
    freeDeliveryThreshold: 2500,
    defaultCharge: 60,
  },
  developerProfile: {
    name: 'SYM_DEV',
    title: 'Full-Stack Developer & UI/UX Engineer',
    bio: 'Professional cyber web developer crafting modern, high-performance web applications and e-commerce platforms. Creator & Developer of RAW BY ZIFAT official store.',
    photoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    website: 'https://sayeemdev69.netlify.app',
    facebook: 'https://facebook.com',
    tiktok: '',
    youtube: '',
    instagram: '',
    whatsapp: 'https://wa.me/8801752714034',
    telegram: '',
    messenger: '',
  },
  showDeveloperProfile: true,
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-oversized',
    name: 'Oversized',
    slug: 'oversized',
    description: 'Relaxed fit, heavy drop-shoulder silhouettes engineered for street elegance.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-tshirts',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: '100% combed organic cotton essentials with tailored ribbed collars.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-panjabi',
    name: 'Panjabi',
    slug: 'panjabi',
    description: 'Modern artisanal linen and fine jacquard panjabi for festive and everyday grace.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies & Sweatshirts',
    slug: 'hoodies',
    description: '380 GSM fleece and French Terry streetwear hoodies built to endure.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-shirts',
    name: 'Shirts',
    slug: 'shirts',
    description: 'Boxy streetwear flannels, clean Cuban collar shirts, and relaxed button-downs.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-pants',
    name: 'Pants & Jeans',
    slug: 'pants',
    description: 'Straight-leg vintage denim, tactical cargos, and relaxed pleated trousers.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    displayOrder: 6,
    isActive: true,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'RAW Signature Oversized Heavyweight Tee',
    slug: 'raw-signature-oversized-heavyweight-tee',
    sku: 'RBZ-OVS-001',
    categoryId: 'cat-oversized',
    categoryName: 'Oversized',
    subcategory: 'Streetwear Tee',
    description: 'The defining piece of RAW BY ZIFAT. Crafted from 260 GSM custom-knit combed cotton with drop-shoulder silhouette, pre-shrunk finish, and a resilient 1.25-inch high-ribbed neckline.',
    shortDescription: '260 GSM combed cotton drop-shoulder minimalist tee.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85',
    price: 850,
    salePrice: 750,
    costPrice: 420,
    discountPercent: 12,
    stockQuantity: 45,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Chalk White', hex: '#F5F5F0' },
      { name: 'Washed Olive', hex: '#4A5340' },
    ],
    material: '100% Combed Compact Cotton',
    gsm: 260,
    codAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOffer: true,
    isPublished: true,
    viewsCount: 184,
    cartAddCount: 29,
    orderCount: 12,
    unitsSoldCount: 15,
    revenue: 11250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Modern Linen Cutaway Panjabi',
    slug: 'modern-linen-cutaway-panjabi',
    sku: 'RBZ-PAN-002',
    categoryId: 'cat-panjabi',
    categoryName: 'Panjabi',
    subcategory: 'Festive & Contemporary',
    description: 'Elevate your celebratory wardrobe with this minimalist monochrome Panjabi. Made with premium natural blend breathable linen, featuring a crisp structured mandarin band collar.',
    shortDescription: 'Pure breathable linen contemporary Panjabi with mandarin collar.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    price: 2450,
    salePrice: 2150,
    costPrice: 1300,
    discountPercent: 12,
    stockQuantity: 28,
    sizes: ['38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'],
    colors: [
      { name: 'Ivory Cream', hex: '#FAF7EE' },
      { name: 'Charcoal Black', hex: '#1C1C1E' },
    ],
    material: 'Organic European Linen Blend',
    gsm: 210,
    codAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOffer: true,
    isPublished: true,
    viewsCount: 142,
    cartAddCount: 18,
    orderCount: 9,
    unitsSoldCount: 9,
    revenue: 19350,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Drop-Shoulder French Terry Boxy Hoodie',
    slug: 'drop-shoulder-french-terry-boxy-hoodie',
    sku: 'RBZ-HOD-003',
    categoryId: 'cat-hoodies',
    categoryName: 'Hoodies & Sweatshirts',
    subcategory: 'Heavy Fleece Outerwear',
    description: 'A structural heavyweight masterpiece engineered for chilly Dhaka evenings and winter street wear. High-density 380 GSM combed cotton French Terry with double-layered hood.',
    shortDescription: '380 GSM heavyweight French Terry drop-shoulder boxy hoodie.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85',
    price: 1850,
    salePrice: 1650,
    costPrice: 950,
    discountPercent: 11,
    stockQuantity: 32,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Onyx Black', hex: '#0B0B0C' },
      { name: 'Heather Ash Grey', hex: '#B2B4B2' },
    ],
    material: '380 GSM Combed Cotton French Terry',
    gsm: 380,
    codAvailable: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOffer: true,
    isPublished: true,
    viewsCount: 220,
    cartAddCount: 35,
    orderCount: 14,
    unitsSoldCount: 14,
    revenue: 23100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'RAW BY ZIFAT // EDITION 01',
    subtitle: 'ENGINEERED STREETWEAR & MODERN BANGLADESHI APPAREL',
    buttonText: 'EXPLORE COLLECTION',
    buttonLink: '/shop',
    desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'hero-2',
    title: 'THE 260 GSM OVERSIZED SERIES',
    subtitle: 'UNCOMPROMISING STRUCTURE. HEAVYWEIGHT COMBED COTTON.',
    buttonText: 'SHOP OVERSIZED',
    buttonLink: '/shop?category=oversized',
    desktopImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85',
    displayOrder: 2,
    isActive: true,
  },
];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'banner-top',
    position: 'top',
    title: 'NEW SEASON STREETWEAR IS NOW LIVE',
    description: 'Free Delivery Across Bangladesh on orders over ৳2,500',
    buttonText: 'Shop New Arrivals',
    buttonLink: '/shop?newArrival=true',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-offer',
    position: 'offer',
    title: 'GET 10% OFF YOUR FIRST ORDER',
    description: 'Use coupon code RAW10 at checkout for instant discount on luxury streetwear.',
    buttonText: 'CLAIM OFFER',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 2,
    isActive: true,
  },
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'RAW10',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscount: 300,
    usageLimit: 500,
    timesUsed: 38,
    isActive: true,
  },
  {
    code: 'ZIFAT50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 800,
    usageLimit: 200,
    timesUsed: 14,
    isActive: true,
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const localFallback = {
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },

  getProduct(slugOrId: string): Product | null {
    const products = this.getProducts();
    return (
      products.find(
        (p) =>
          p.slug.toLowerCase() === slugOrId.toLowerCase() ||
          p.id.toLowerCase() === slugOrId.toLowerCase()
      ) || null
    );
  },

  saveProducts(products: Product[]): void {
    setStored(STORAGE_KEYS.PRODUCTS, products);
  },

  getCategories(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  saveCategories(categories: Category[]): void {
    setStored(STORAGE_KEYS.CATEGORIES, categories);
  },

  getHeroSlides(): HeroSlide[] {
    return getStored<HeroSlide[]>(STORAGE_KEYS.HERO_SLIDES, DEFAULT_HERO_SLIDES);
  },

  saveHeroSlides(slides: HeroSlide[]): void {
    setStored(STORAGE_KEYS.HERO_SLIDES, slides);
  },

  getBanners(): Banner[] {
    return getStored<Banner[]>(STORAGE_KEYS.BANNERS, DEFAULT_BANNERS);
  },

  saveBanners(banners: Banner[]): void {
    setStored(STORAGE_KEYS.BANNERS, banners);
  },

  getSettings(): SiteSettings {
    return getStored<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: SiteSettings): void {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  },

  getCoupons(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
  },

  saveCoupons(coupons: Coupon[]): void {
    setStored(STORAGE_KEYS.COUPONS, coupons);
  },

  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  saveOrders(orders: Order[]): void {
    setStored(STORAGE_KEYS.ORDERS, orders);
  },

  createOrder(orderData: Partial<Order>): Order {
    const orders = this.getOrders();
    const id = `RBZ-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id,
      customerName: orderData.customerName || 'Customer',
      phone: orderData.phone || '',
      district: orderData.district || 'Dhaka',
      area: orderData.area || 'Banani',
      address: orderData.address || '',
      deliveryNote: orderData.deliveryNote,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryCharge: orderData.deliveryCharge || 60,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: (orderData.paymentStatus as any) || 'pending',
      orderStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    orders[idx].orderStatus = orderStatus;
    if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
    orders[idx].updatedAt = new Date().toISOString();
    this.saveOrders(orders);
    return orders[idx];
  },

  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  addAuditLog(action: string, details: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      adminEmail: 'zifat69 (Offline Local)',
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 50));
  },
};
