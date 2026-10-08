export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  priceAdjustment: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  images: string[];
  thumbnail: string;
  price: number;
  salePrice?: number;
  costPrice?: number; // for admin profit calculation
  discountPercent?: number;
  stockQuantity: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  material?: string;
  gsm?: number;
  codAvailable: boolean; // Product-specific Cash on Delivery
  tiktokReviewUrl?: string; // TikTok review video or embed URL if uploaded
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOffer: boolean;
  isPublished: boolean;
  viewsCount: number;
  cartAddCount: number;
  orderCount: number;
  unitsSoldCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  salePrice?: number;
  costPrice?: number;
  codAvailable: boolean;
  maxStock: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'cod_pending';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  costPrice?: number;
}

export interface Order {
  id: string; // e.g. RBZ-2026-8492
  customerName: string;
  phone: string;
  alternativePhone?: string;
  district: string;
  area: string;
  address: string;
  deliveryNote?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    senderPhone?: string;
    transactionId?: string;
    amount?: number;
    notes?: string;
  };
  orderStatus: OrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAccountSettings {
  enabled: boolean;
  number: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  instructions: string;
}

export interface DeliverySettings {
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  freeDeliveryThreshold: number; // e.g. 2500 BDT
  defaultCharge: number;
}

export interface DeveloperProfile {
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  website: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  instagram: string;
  whatsapp: string;
  telegram: string;
  messenger: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  desktopImage: string;
  mobileImage: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  position: 'top' | 'mid' | 'offer' | 'category' | 'promo';
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
}

export interface SiteSettings {
  siteName: string;
  announcementBar?: string;
  logoUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  phone: string;
  email: string;
  address: string;
  codMode: 'product_specific' | 'global_enabled' | 'global_disabled';
  paymentSettings: {
    bkash: PaymentAccountSettings;
    nagad: PaymentAccountSettings;
  };
  deliverySettings: DeliverySettings;
  developerProfile: DeveloperProfile;
  showDeveloperProfile?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  timestamp: string;
}

export interface AnalyticsStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSales: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalViews: number;
  totalCartAdds: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  mostViewedProducts: Product[];
  mostOrderedProducts: Product[];
  recentOrders: Order[];
}
