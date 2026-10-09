import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  Product,
  Category,
  Order,
  HeroSlide,
  Banner,
  Coupon,
  SiteSettings,
  AuditLog,
} from '../src/types/index.js';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  heroSlides: HeroSlide[];
  banners: Banner[];
  coupons: Coupon[];
  settings: SiteSettings;
  auditLogs: AuditLog[];
  adminUsers: {
    id: string;
    email: string;
    passwordHash: string;
    salt: string;
    role: string;
    createdAt: string;
  }[];
  analytics: {
    pageViews: number;
    productViews: number;
    cartAddEvents: number;
    checkoutStartedEvents: number;
    ordersCompletedEvents: number;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'raw_by_zifat_store.json');

// Password hashing using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'RAW BY ZIFAT',
  logoUrl: '',
  mobileLogoUrl: '',
  faviconUrl: '',
  phone: '+880 1712-345678',
  email: 'support@rawbyzifat.com',
  address: 'Banani 11, Dhaka 1213, Bangladesh',
  codMode: 'product_specific',
  paymentSettings: {
    bkash: {
      enabled: true,
      number: '01812345678',
      accountType: 'Personal',
      instructions: 'Go to your bKash app or dial *247# > Send Money to this Personal Number. Enter Reference as RAW. Copy the Transaction ID (TrxID) and enter it below with your sender phone number.',
    },
    nagad: {
      enabled: true,
      number: '01612345678',
      accountType: 'Personal',
      instructions: 'Go to your Nagad app or dial *167# > Send Money to this Personal Number. Enter Reference as RAW. Copy the Transaction ID (TrxID) and enter it below with your sender phone number.',
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

const INITIAL_CATEGORIES: Category[] = [
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
  {
    id: 'cat-polo',
    name: 'Polo',
    slug: 'polo',
    description: 'Heavyweight pique cotton polos with minimal contrast tipping.',
    image: 'https://images.unsplash.com/photo-1625910513413-568bfd0ce241?auto=format&fit=crop&w=800&q=80',
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-jackets',
    name: 'Jackets',
    slug: 'jackets',
    description: 'Matte water-resistant bombers, denim trucker jackets, and light outerwear.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    displayOrder: 8,
    isActive: true,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'RAW Signature Oversized Heavyweight Tee',
    slug: 'raw-signature-oversized-heavyweight-tee',
    sku: 'RBZ-OVS-001',
    categoryId: 'cat-oversized',
    categoryName: 'Oversized',
    subcategory: 'Streetwear Tee',
    description: 'The defining piece of RAW BY ZIFAT. Crafted from 260 GSM custom-knit combed cotton with drop-shoulder silhouette, pre-shrunk finish, and a resilient 1.25-inch high-ribbed neckline. Designed to maintain its boxy architecture wash after wash.',
    shortDescription: '260 GSM combed cotton drop-shoulder minimalist tee.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85',
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
    description: 'Elevate your celebratory wardrobe with this minimalist monochrome Panjabi. Made with premium natural blend breathable linen, featuring a crisp structured mandarin band collar, subtle geometric stitching, and metallic snap-fasteners.',
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
      { name: 'Slate Teal', hex: '#2A4B4B' },
    ],
    material: 'Organic European Linen Blend',
    gsm: 210,
    codAvailable: true,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOffer: true,
    isPublished: true,
    viewsCount: 142,
    cartAddCount: 18,
    orderCount: 6,
    unitsSoldCount: 7,
    revenue: 15050,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Monochrome Heavy French Terry Hoodie',
    slug: 'monochrome-heavy-french-terry-hoodie',
    sku: 'RBZ-HOD-003',
    categoryId: 'cat-hoodies',
    categoryName: 'Hoodies & Sweatshirts',
    subcategory: 'Streetwear Outerwear',
    description: 'Engineered for the cooler evenings and studio comfort. 380 GSM loopback French Terry fleece with a double-layered hood without cheap drawstrings for an uncompromising, sculptural minimal profile. Deep kangaroo pouch and wide ribbing.',
    shortDescription: '380 GSM ultra-heavy French Terry hoodie with seamless double hood.',
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
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Black', hex: '#121212' },
      { name: 'Heather Gray', hex: '#8A8D8F' },
      { name: 'Earth Clay', hex: '#8C6754' },
    ],
    material: '380 GSM Loopback French Terry Cotton',
    gsm: 380,
    // Note: Demonstration of COD restricted product per spec!
    codAvailable: false,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOffer: false,
    isPublished: true,
    viewsCount: 220,
    cartAddCount: 41,
    orderCount: 16,
    unitsSoldCount: 18,
    revenue: 29700,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'Acid Washed Wide-Leg Denim Trousers',
    slug: 'acid-washed-wide-leg-denim-trousers',
    sku: 'RBZ-JNS-004',
    categoryId: 'cat-pants',
    categoryName: 'Pants & Jeans',
    subcategory: 'Vintage Denim',
    description: 'Premium 14oz non-stretch ring-spun cotton denim subjected to vintage stone and enzyme washing. Designed with a high rise, generous relaxed straight cut through the thigh, and custom RAW engraved silver hardware.',
    shortDescription: '14oz rigid non-stretch vintage wash straight denim pants.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=85',
    price: 1950,
    costPrice: 1050,
    stockQuantity: 19,
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Vintage Acid Blue', hex: '#68849E' },
      { name: 'Faded Charcoal', hex: '#3B3B3B' },
    ],
    material: '14oz Ring-Spun Cotton Denim',
    gsm: 400,
    codAvailable: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isOffer: false,
    isPublished: true,
    viewsCount: 95,
    cartAddCount: 14,
    orderCount: 8,
    unitsSoldCount: 9,
    revenue: 17550,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: 'Tactical Minimalist Cargo Pant',
    slug: 'tactical-minimalist-cargo-pant',
    sku: 'RBZ-CRG-005',
    categoryId: 'cat-pants',
    categoryName: 'Pants & Jeans',
    subcategory: 'Utility Bottoms',
    description: 'Constructed from durable ripstop cotton with an elasticized waistband and tonal internal drawcord. Features dual sleek flush bellows pockets with concealed matte magnetic closures and adjustable ankle cuffs for versatile styling.',
    shortDescription: 'Ripstop cotton utilitarian cargo pants with magnetic pocket closures.',
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=85',
    price: 1650,
    salePrice: 1450,
    costPrice: 820,
    discountPercent: 12,
    stockQuantity: 24,
    sizes: ['M (30-31)', 'L (32-33)', 'XL (34-35)', 'XXL (36-37)'],
    colors: [
      { name: 'Combat Olive', hex: '#3C4332' },
      { name: 'Matte Black', hex: '#111111' },
      { name: 'Slate Gray', hex: '#585C61' },
    ],
    material: '100% Cotton Ripstop (240 GSM)',
    gsm: 240,
    codAvailable: true,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    isOffer: true,
    isPublished: true,
    viewsCount: 110,
    cartAddCount: 19,
    orderCount: 5,
    unitsSoldCount: 5,
    revenue: 7250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'Clean Ribbed Pique Polo Shirt',
    slug: 'clean-ribbed-pique-polo-shirt',
    sku: 'RBZ-POL-006',
    categoryId: 'cat-polo',
    categoryName: 'Polo',
    subcategory: 'Smart Casual',
    description: 'A contemporary take on timeless sportswear. Woven from 230 GSM double-combed pique cotton with zero external logos, two understated rubberized tonal buttons, and an engineered flat-knit collar designed never to roll or curl.',
    shortDescription: '230 GSM double-combed pique cotton polo with anti-roll collar.',
    images: [
      'https://images.unsplash.com/photo-1625910513413-568bfd0ce241?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1625910513413-568bfd0ce241?auto=format&fit=crop&w=800&q=85',
    price: 990,
    salePrice: 890,
    costPrice: 480,
    discountPercent: 10,
    stockQuantity: 36,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Navy Midnight', hex: '#131E2B' },
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Wine Burgundy', hex: '#4A1521' },
    ],
    material: 'Double Combed Cotton Pique',
    gsm: 230,
    codAvailable: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOffer: false,
    isPublished: true,
    viewsCount: 88,
    cartAddCount: 12,
    orderCount: 4,
    unitsSoldCount: 4,
    revenue: 3560,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Raw Heavyweight Zipper Bomber Jacket',
    slug: 'raw-heavyweight-zipper-bomber-jacket',
    sku: 'RBZ-JKT-007',
    categoryId: 'cat-jackets',
    categoryName: 'Jackets',
    subcategory: 'Outerwear',
    description: 'Statement minimalist outerwear. Water-repellent nylon twill shell lined with breathable cupro satin. Features a heavy two-way gunmetal YKK zipper, hidden storm placket, inside pocket, and dense wool-blend ribbed cuffs.',
    shortDescription: 'Water-repellent nylon twill bomber jacket with two-way heavy YKK zipper.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85',
    price: 2650,
    salePrice: 2350,
    costPrice: 1400,
    discountPercent: 11,
    stockQuantity: 15,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Matte Black', hex: '#1A1A1A' },
      { name: 'Deep Khaki', hex: '#474334' },
    ],
    material: 'High-Density Nylon Twill with Satin Lining',
    gsm: 320,
    codAvailable: false, // Prepayment required
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOffer: true,
    isPublished: true,
    viewsCount: 165,
    cartAddCount: 22,
    orderCount: 7,
    unitsSoldCount: 7,
    revenue: 16450,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Boxy Cuban Collar Linen Short Sleeve Shirt',
    slug: 'boxy-cuban-collar-linen-short-sleeve-shirt',
    sku: 'RBZ-SHT-008',
    categoryId: 'cat-shirts',
    categoryName: 'Shirts',
    subcategory: 'Summer Casual',
    description: 'Relaxed tropical sophistication. Crafted from lightweight pre-washed linen with an open camp collar, straight hem with side vents, and natural corozo nut buttons. Designed to be worn unbuttoned over a RAW tank or buttoned standalone.',
    shortDescription: 'Pre-washed pure linen camp collar boxy summer shirt.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85',
    price: 1350,
    costPrice: 700,
    stockQuantity: 25,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Sand Dune', hex: '#D2B48C' },
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Sage Green', hex: '#879F84' },
    ],
    material: '100% European Flax Linen',
    gsm: 180,
    codAvailable: true,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOffer: false,
    isPublished: true,
    viewsCount: 76,
    cartAddCount: 11,
    orderCount: 3,
    unitsSoldCount: 3,
    revenue: 4050,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_HERO_SLIDES: HeroSlide[] = [
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
  {
    id: 'hero-3',
    title: 'ARTISANAL CONTEMPORARY PANJABI',
    subtitle: 'PURITY IN FORM. BREATHABLE LINEN SILHOUETTES.',
    buttonText: 'VIEW PANJABI',
    buttonLink: '/shop?category=panjabi',
    desktopImage: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1800&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=85',
    displayOrder: 3,
    isActive: true,
  },
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-top',
    position: 'top',
    title: 'FREE EXPRESS SHIPPING ON ORDERS OVER ৳2,500 ACROSS BANGLADESH',
    description: 'All orders dispatched within 24 hours from Dhaka central hub.',
    image: '',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'banner-mid',
    position: 'mid',
    title: 'CRAFTED WITH INTENT. WORN WITH CONFIDENCE.',
    description: 'Every seam, fabric weight, and collar dimension is rigorously calibrated to give you timeless streetwear luxury.',
    buttonText: 'DISCOVER OUR CRAFT',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'banner-offer',
    position: 'offer',
    title: 'SPECIAL INTRODUCTORY DROP',
    description: 'Use coupon code RAW10 at checkout to receive 10% off your entire first order.',
    buttonText: 'SHOP THE DROP',
    buttonLink: '/shop',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85',
    displayOrder: 3,
    isActive: true,
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'RAW10',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscount: 300,
    timesUsed: 14,
    isActive: true,
  },
  {
    code: 'EID150',
    discountType: 'fixed',
    discountValue: 150,
    minOrderAmount: 1500,
    timesUsed: 8,
    isActive: true,
  },
];

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database from file, initializing fresh:', err);
    }

    // Default admin account: admin12 / zifat12
    const { hash, salt } = hashPassword('zifat12');

    const fresh: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: [],
      heroSlides: INITIAL_HERO_SLIDES,
      banners: INITIAL_BANNERS,
      coupons: INITIAL_COUPONS,
      settings: INITIAL_SETTINGS,
      auditLogs: [
        {
          id: 'log-001',
          action: 'STORE_INITIALIZED',
          details: 'RAW BY ZIFAT clothing database initialized with fashion collections and Bangladesh payment defaults.',
          adminEmail: 'system',
          timestamp: new Date().toISOString(),
        },
      ],
      adminUsers: [
        {
          id: 'admin-001',
          email: 'admin12',
          passwordHash: hash,
          salt: salt,
          role: 'SUPER_ADMIN',
          createdAt: new Date().toISOString(),
        },
      ],
      analytics: {
        pageViews: 1240,
        productViews: 840,
        cartAddEvents: 142,
        checkoutStartedEvents: 68,
        ordersCompletedEvents: 51,
      },
    };

    this.persistSync(fresh);
    return fresh;
  }

  private persistSync(data: DatabaseSchema) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tmp = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        this.persistSync(this.data);
      } catch (err) {
        console.error('Error writing database to disk:', err);
      }
    }, 50);
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductBySlug(slugOrId: string): Product | undefined {
    return this.data.products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId || p.sku.toLowerCase() === slugOrId.toLowerCase()
    );
  }

  public addProduct(p: Product, adminEmail: string): Product {
    this.data.products.unshift(p);
    this.addAuditLog('PRODUCT_CREATED', `Created product "${p.name}" (SKU: ${p.sku})`, adminEmail);
    this.save();
    return p;
  }

  public updateProduct(id: string, updates: Partial<Product>, adminEmail: string): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog('PRODUCT_UPDATED', `Updated product "${this.data.products[idx].name}" (ID: ${id})`, adminEmail);
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string, adminEmail: string): boolean {
    const p = this.data.products.find((prod) => prod.id === id);
    if (!p) return false;
    this.data.products = this.data.products.filter((prod) => prod.id !== id);
    this.addAuditLog('PRODUCT_DELETED', `Deleted product "${p.name}" (ID: ${id})`, adminEmail);
    this.save();
    return true;
  }

  public incrementProductViews(idOrSlug: string) {
    const p = this.data.products.find((prod) => prod.id === idOrSlug || prod.slug === idOrSlug);
    if (p) {
      p.viewsCount = (p.viewsCount || 0) + 1;
      this.data.analytics.productViews += 1;
      this.save();
    }
  }

  public incrementCartAdd(productId: string) {
    const p = this.data.products.find((prod) => prod.id === productId);
    if (p) {
      p.cartAddCount = (p.cartAddCount || 0) + 1;
      this.data.analytics.cartAddEvents += 1;
      this.save();
    }
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addCategory(cat: Category, adminEmail: string): Category {
    this.data.categories.push(cat);
    this.addAuditLog('CATEGORY_CREATED', `Created category "${cat.name}"`, adminEmail);
    this.save();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<Category>, adminEmail: string): Category | undefined {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.addAuditLog('CATEGORY_UPDATED', `Updated category "${this.data.categories[idx].name}"`, adminEmail);
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string, adminEmail: string): boolean {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) return false;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.addAuditLog('CATEGORY_DELETED', `Deleted category "${cat.name}"`, adminEmail);
    this.save();
    return true;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderByIdAndPhone(orderId: string, phone: string): Order | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.data.orders.find((o) => {
      const matchId = o.id.toLowerCase() === orderId.trim().toLowerCase();
      const oPhone = o.phone.replace(/[^0-9]/g, '');
      const matchPhone = oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone);
      return matchId && matchPhone;
    });
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.data.orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
  }

  public createOrder(order: Order): Order {
    // Decrement stock and update product counters atomically
    for (const item of order.items) {
      const p = this.data.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stockQuantity = Math.max(0, p.stockQuantity - item.quantity);
        p.orderCount = (p.orderCount || 0) + 1;
        p.unitsSoldCount = (p.unitsSoldCount || 0) + item.quantity;
        p.revenue = (p.revenue || 0) + item.subtotal;
      }
    }

    this.data.orders.unshift(order);
    this.data.analytics.ordersCompletedEvents += 1;
    this.save();
    return order;
  }

  public updateOrderStatus(
    orderId: string,
    updates: Partial<Order>,
    adminEmail: string
  ): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    const old = this.data.orders[idx];
    const updated = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If order is cancelled, restore stock!
    if (old.orderStatus !== 'cancelled' && updates.orderStatus === 'cancelled') {
      for (const item of old.items) {
        const p = this.data.products.find((prod) => prod.id === item.productId);
        if (p) {
          p.stockQuantity += item.quantity;
          p.unitsSoldCount = Math.max(0, (p.unitsSoldCount || 0) - item.quantity);
          p.revenue = Math.max(0, (p.revenue || 0) - item.subtotal);
        }
      }
    }

    this.data.orders[idx] = updated;
    this.addAuditLog(
      'ORDER_STATUS_CHANGED',
      `Order ${orderId}: status -> ${updated.orderStatus}, payment -> ${updated.paymentStatus}`,
      adminEmail
    );
    this.save();
    return updated;
  }

  // --- Hero Slides & Banners ---
  public getHeroSlides(): HeroSlide[] {
    return this.data.heroSlides.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public updateHeroSlides(slides: HeroSlide[], adminEmail: string) {
    this.data.heroSlides = slides;
    this.addAuditLog('HERO_SLIDES_UPDATED', `Updated ${slides.length} hero slides`, adminEmail);
    this.save();
  }

  public getBanners(): Banner[] {
    return this.data.banners.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public updateBanners(banners: Banner[], adminEmail: string) {
    this.data.banners = banners;
    this.addAuditLog('BANNERS_UPDATED', `Updated ${banners.length} promotional banners`, adminEmail);
    this.save();
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  public addCoupon(coupon: Coupon, adminEmail: string): Coupon {
    this.data.coupons.push(coupon);
    this.addAuditLog('COUPON_CREATED', `Created coupon "${coupon.code}"`, adminEmail);
    this.save();
    return coupon;
  }

  public updateCoupon(code: string, updates: Partial<Coupon>, adminEmail: string): Coupon | undefined {
    const idx = this.data.coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (idx === -1) return undefined;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.addAuditLog('COUPON_UPDATED', `Updated coupon "${code}"`, adminEmail);
    this.save();
    return this.data.coupons[idx];
  }

  public deleteCoupon(code: string, adminEmail: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
    if (this.data.coupons.length < initialLen) {
      this.addAuditLog('COUPON_DELETED', `Deleted coupon "${code}"`, adminEmail);
      this.save();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<SiteSettings>, adminEmail: string): SiteSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.addAuditLog('SETTINGS_UPDATED', 'Updated store configuration & payments', adminEmail);
    this.save();
    return this.data.settings;
  }

  // --- Audit Logs ---
  public addAuditLog(action: string, details: string, adminEmail: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      adminEmail: adminEmail || 'admin',
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Admin Users ---
  public getAdminByEmail(email: string) {
    return this.data.adminUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public updateAdminPassword(email: string, newPasswordHash: string, newSalt: string) {
    const user = this.getAdminByEmail(email);
    if (user) {
      user.passwordHash = newPasswordHash;
      user.salt = newSalt;
      this.save();
      return true;
    }
    return false;
  }

  // --- Analytics ---
  public recordPageView() {
    this.data.analytics.pageViews += 1;
    this.save();
  }

  public recordCheckoutStarted() {
    this.data.analytics.checkoutStartedEvents += 1;
    this.save();
  }

  public getAnalytics() {
    const products = this.data.products;
    const orders = this.data.orders;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
    const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled');

    // Revenue only from non-cancelled orders
    const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
    const todaySales = validOrders
      .filter((o) => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);
    const weekSales = validOrders
      .filter((o) => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);
    const monthSales = validOrders
      .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + o.total, 0);

    // Calculate product costs & gross profit
    let totalCost = 0;
    for (const ord of validOrders) {
      for (const item of ord.items) {
        if (item.costPrice) {
          totalCost += item.costPrice * item.quantity;
        } else {
          const p = products.find((prod) => prod.id === item.productId);
          if (p && p.costPrice) {
            totalCost += p.costPrice * item.quantity;
          }
        }
      }
    }

    const totalRevenue = totalSales;
    const totalProfit = totalCost > 0 ? totalRevenue - totalCost : 0;

    const mostViewedProducts = [...products].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);
    const mostOrderedProducts = [...products].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0)).slice(0, 5);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalSales,
      todaySales,
      weekSales,
      monthSales,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isPublished && p.stockQuantity > 0).length,
      outOfStockProducts: products.filter((p) => p.stockQuantity === 0).length,
      totalViews: this.data.analytics.pageViews + this.data.analytics.productViews,
      totalCartAdds: this.data.analytics.cartAddEvents,
      totalRevenue,
      totalCost,
      totalProfit,
      mostViewedProducts,
      mostOrderedProducts,
      recentOrders: orders.slice(0, 8),
    };
  }
}

export const db = new Database();
