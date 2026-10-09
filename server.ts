import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { requireAdminAuth, loginAdmin, verifyAdminToken, revokeAdminToken, type AuthenticatedRequest } from './server/auth.js';
import { handleSupportChat } from './server/ai.js';
import type { Order, Product, Category, Coupon, HeroSlide, Banner, SiteSettings } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in dev
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // console.log(`${req.method} ${req.path}`);
  }
  next();
});

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// 1. Get products (with filters & search)
app.get('/api/products', (req: Request, res: Response) => {
  let products = db.getProducts().filter((p) => p.isPublished);

  const { category, search, featured, newArrival, bestSeller, offer, sort } = req.query;

  if (category && typeof category === 'string') {
    const catQuery = category.trim().toLowerCase();
    const allCategories = db.getCategories();
    const matchedCategory = allCategories.find(
      (c) =>
        c.slug.toLowerCase() === catQuery ||
        c.id.toLowerCase() === catQuery ||
        c.name.toLowerCase() === catQuery
    );
    const targetId = matchedCategory?.id.toLowerCase();
    const targetSlug = matchedCategory?.slug.toLowerCase() || catQuery;
    const targetName = matchedCategory?.name.toLowerCase();

    products = products.filter((p) => {
      const pCatId = (p.categoryId || '').toLowerCase();
      const pCatName = (p.categoryName || '').toLowerCase();

      if (targetId) {
        return (
          pCatId === targetId ||
          pCatId === `cat-${targetSlug}` ||
          pCatId === targetSlug ||
          (targetName && pCatName === targetName)
        );
      }
      return (
        pCatId === catQuery ||
        pCatId === `cat-${catQuery}` ||
        pCatName === catQuery ||
        pCatName.includes(catQuery)
      );
    });
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.colors.some((c) => c.name.toLowerCase().includes(q)) ||
        p.sizes.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (featured === 'true') products = products.filter((p) => p.isFeatured);
  if (newArrival === 'true') products = products.filter((p) => p.isNewArrival);
  if (bestSeller === 'true') products = products.filter((p) => p.isBestSeller);
  if (offer === 'true') products = products.filter((p) => p.isOffer);

  // Sorting
  if (sort === 'price-low') {
    products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sort === 'price-high') {
    products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sort === 'popular') {
    products.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  } else if (sort === 'best-selling') {
    products.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
  } else {
    // default: newest
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(products);
});

// 2. Get single product by slug or id (and count view)
app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const product = db.getProductBySlug(slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Increment view count
  db.incrementProductViews(product.id);

  res.json(product);
});

// 3. Get categories
app.get('/api/categories', (req: Request, res: Response) => {
  const categories = db.getCategories().filter((c) => c.isActive);
  const products = db.getProducts().filter((p) => p.isPublished);

  // Enrich with live product count
  const enriched = categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categoryId === c.id || p.categoryName === c.name).length,
  }));

  res.json(enriched);
});

// 4. Get active Hero Slides
app.get('/api/hero-slides', (req: Request, res: Response) => {
  const slides = db.getHeroSlides().filter((s) => s.isActive);
  res.json(slides);
});

// 5. Get active Banners
app.get('/api/banners', (req: Request, res: Response) => {
  const banners = db.getBanners().filter((b) => b.isActive);
  res.json(banners);
});

// 6. Get public store settings
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

// 7. Validate Cart items (Stock check, Real Prices, Product-specific COD check)
app.post('/api/cart/validate', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }

  const allProducts = db.getProducts();
  const validatedItems: any[] = [];
  let isCodAvailableOverall = true;
  let codRestrictionReason = '';

  for (const item of items) {
    const prod = allProducts.find((p) => p.id === item.productId || p.slug === item.slug);
    if (!prod || !prod.isPublished) {
      continue;
    }

    const currentPrice = prod.salePrice || prod.price;
    const isCodForProduct = prod.codAvailable !== false;

    if (!isCodForProduct) {
      isCodAvailableOverall = false;
      codRestrictionReason = `Cash on Delivery is unavailable because "${prod.name}" requires advance payment (bKash/Nagad).`;
    }

    validatedItems.push({
      productId: prod.id,
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      image: prod.thumbnail || prod.images[0],
      size: item.size || prod.sizes[0],
      color: item.color || prod.colors[0]?.name || 'Standard',
      quantity: Math.min(item.quantity || 1, prod.stockQuantity),
      unitPrice: currentPrice,
      costPrice: prod.costPrice,
      codAvailable: isCodForProduct,
      maxStock: prod.stockQuantity,
      isOutOfStock: prod.stockQuantity <= 0,
    });
  }

  const settings = db.getSettings();
  if (settings.codMode === 'global_disabled') {
    isCodAvailableOverall = false;
    codRestrictionReason = 'Cash on Delivery is currently disabled by store management.';
  } else if (settings.codMode === 'global_enabled') {
    isCodAvailableOverall = true;
    codRestrictionReason = '';
  }

  res.json({
    items: validatedItems,
    isCodAvailable: isCodAvailableOverall,
    codRestrictionReason,
  });
});

// 8. Validate Coupon
app.post('/api/coupons/apply', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Please enter a coupon code' });
  }

  const coupon = db.getCouponByCode(code);
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `Coupon requires a minimum order amount of ৳${coupon.minOrderAmount}`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  res.json({
    valid: true,
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
});

// 9. Place Order (Guest Checkout with strict server-side validation)
app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customerName,
    phone,
    alternativePhone,
    district,
    area,
    address,
    deliveryNote,
    items,
    couponCode,
    paymentMethod,
    paymentDetails,
  } = req.body;

  // Validation
  if (!customerName?.trim()) return res.status(400).json({ error: 'Customer name is required' });
  if (!phone?.trim()) return res.status(400).json({ error: 'Customer phone number is required' });
  if (!district?.trim()) return res.status(400).json({ error: 'Delivery district is required' });
  if (!address?.trim()) return res.status(400).json({ error: 'Full delivery address is required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }
  if (!['cod', 'bkash', 'nagad'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method selected' });
  }

  const allProducts = db.getProducts();
  const settings = db.getSettings();

  // Validate products, calculate server-authoritative prices, check COD restriction
  const verifiedItems: any[] = [];
  let calculatedSubtotal = 0;
  let hasCodRestrictedProduct = false;
  let restrictedProductName = '';

  for (const item of items) {
    const prod = allProducts.find((p) => p.id === item.productId || p.slug === item.slug);
    if (!prod) {
      return res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
    }

    if (prod.stockQuantity < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity}`,
      });
    }

    if (prod.codAvailable === false) {
      hasCodRestrictedProduct = true;
      restrictedProductName = prod.name;
    }

    const unitPrice = prod.salePrice || prod.price;
    const itemSubtotal = unitPrice * item.quantity;
    calculatedSubtotal += itemSubtotal;

    verifiedItems.push({
      productId: prod.id,
      productName: prod.name,
      productSlug: prod.slug,
      image: prod.thumbnail || prod.images[0] || '',
      size: item.size || 'M',
      color: item.color || 'Standard',
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal,
      costPrice: prod.costPrice,
    });
  }

  // Validate COD rule
  if (paymentMethod === 'cod') {
    if (settings.codMode === 'global_disabled') {
      return res.status(400).json({ error: 'Cash on Delivery is currently unavailable.' });
    }
    if (settings.codMode === 'product_specific' && hasCodRestrictedProduct) {
      return res.status(400).json({
        error: `Cash on Delivery is not available because "${restrictedProductName}" requires advance payment.`,
      });
    }
  }

  // If manual bKash or Nagad, validate sender phone & trxID
  if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
    if (!paymentDetails?.senderPhone || !paymentDetails?.transactionId) {
      return res.status(400).json({
        error: `Please provide your ${paymentMethod.toUpperCase()} sender phone number and Transaction ID (TrxID).`,
      });
    }
  }

  // Calculate delivery charge
  const isInsideDhaka = district.toLowerCase().includes('dhaka');
  let deliveryCharge = isInsideDhaka
    ? settings.deliverySettings.insideDhakaCharge
    : settings.deliverySettings.outsideDhakaCharge;

  if (calculatedSubtotal >= settings.deliverySettings.freeDeliveryThreshold) {
    deliveryCharge = 0;
  }

  // Calculate coupon discount
  let discount = 0;
  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    if (coupon && coupon.isActive && (!coupon.minOrderAmount || calculatedSubtotal >= coupon.minOrderAmount)) {
      if (coupon.discountType === 'percent') {
        discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, calculatedSubtotal);
      }
      coupon.timesUsed += 1;
    }
  }

  const finalTotal = Math.max(0, calculatedSubtotal + deliveryCharge - discount);

  // Generate unique Order ID, e.g. RBZ-2026-XXXXX
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `RBZ-${randomSuffix}`;

  const paymentStatus = paymentMethod === 'cod' ? 'cod_pending' : 'pending';

  const newOrder: Order = {
    id: orderId,
    customerName: customerName.trim(),
    phone: phone.trim(),
    alternativePhone: alternativePhone?.trim() || undefined,
    district: district.trim(),
    area: area?.trim() || district.trim(),
    address: address.trim(),
    deliveryNote: deliveryNote?.trim() || undefined,
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    deliveryCharge,
    discount,
    couponCode: discount > 0 ? couponCode : undefined,
    total: finalTotal,
    paymentMethod,
    paymentStatus,
    paymentDetails:
      paymentMethod !== 'cod'
        ? {
            senderPhone: paymentDetails.senderPhone,
            transactionId: paymentDetails.transactionId,
            amount: finalTotal,
            notes: paymentDetails.notes,
          }
        : undefined,
    orderStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.createOrder(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: created,
  });
});

// 10. Order Tracking (Requires Order ID; phone is optional for additional verification)
app.post('/api/orders/track', (req: Request, res: Response) => {
  const { orderId, phone } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required for tracking' });
  }

  let order = phone ? db.getOrderByIdAndPhone(orderId, phone) : db.getOrderById(orderId);
  if (!order && phone) {
    // Also try without phone if phone format differed
    order = db.getOrderById(orderId);
  }

  if (!order) {
    return res.status(404).json({
      error: 'No order found matching this Order ID. Please verify your details.',
    });
  }

  res.json(order);
});

// 10b. Public Order Receipt / Details
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// 11. Customer Support AI & Admin Trigger
app.post('/api/support/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await handleSupportChat(message, history || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// 12. Record analytics event
app.post('/api/analytics/event', (req: Request, res: Response) => {
  const { eventType, productId } = req.body;
  if (eventType === 'page_view') {
    db.recordPageView();
  } else if (eventType === 'cart_add' && productId) {
    db.incrementCartAdd(productId);
  } else if (eventType === 'checkout_started') {
    db.recordCheckoutStarted();
  }
  res.json({ ok: true });
});

// -------------------------------------------------------------
// ADMIN SECURE ENDPOINTS
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const userIdentifier = username || email;
  if (!userIdentifier || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = loginAdmin(userIdentifier, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error || 'Authentication failed' });
  }

  res.json({
    success: true,
    token: result.token,
    user: { username: 'admin12', email: 'admin12', role: 'SUPER_ADMIN' },
  });
});

// Admin Verify Auth Session
app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    authenticated: true,
    user: {
      username: 'admin12',
      email: 'admin12',
      role: req.adminUser?.role || 'SUPER_ADMIN',
    },
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    revokeAdminToken(authHeader.slice(7));
  }
  res.json({ success: true });
});

// Admin Dashboard Analytics
app.get('/api/admin/analytics', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAnalytics();
  res.json(stats);
});

// Admin Orders Management
app.get('/api/admin/orders', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status, paymentStatus, search } = req.query;
  let orders = db.getOrders();

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === status);
  }

  if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.paymentDetails?.transactionId?.toLowerCase().includes(q)
    );
  }

  res.json(orders);
});

// Admin Update Order Status
app.put('/api/admin/orders/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const adminEmail = req.adminUser?.email || 'admin';

  const updated = db.updateOrderStatus(id, updates, adminEmail);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ success: true, order: updated });
});

// Admin Products CRUD
app.get('/api/admin/products', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const products = db.getProducts();
  res.json(products);
});

app.post('/api/admin/products', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const adminEmail = req.adminUser?.email || 'admin';

  if (!data.name || !data.price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const chosenCategoryId = data.categoryId || 'cat-oversized';
  let chosenCategoryName = data.categoryName;
  if (!chosenCategoryName) {
    const foundCategory = db.getCategories().find((c) => c.id === chosenCategoryId || c.slug === chosenCategoryId);
    chosenCategoryName = foundCategory ? foundCategory.name : 'Oversized';
  }

  const newProd: Product = {
    id: `prod-${Date.now()}`,
    name: data.name,
    slug: slug,
    sku: data.sku || `RBZ-${Math.floor(100 + Math.random() * 900)}`,
    categoryId: chosenCategoryId,
    categoryName: chosenCategoryName,
    subcategory: data.subcategory || '',
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.thumbnail || ''],
    thumbnail: data.thumbnail || data.images?.[0] || '',
    price: Number(data.price),
    salePrice: data.salePrice ? Number(data.salePrice) : undefined,
    costPrice: data.costPrice ? Number(data.costPrice) : undefined,
    discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
    stockQuantity: Number(data.stockQuantity || 0),
    sizes: Array.isArray(data.sizes) ? data.sizes : ['M', 'L', 'XL'],
    colors: Array.isArray(data.colors) ? data.colors : [{ name: 'Black', hex: '#000000' }],
    material: data.material || '100% Combed Cotton',
    gsm: data.gsm ? Number(data.gsm) : undefined,
    codAvailable: data.codAvailable !== false,
    tiktokReviewUrl: data.tiktokReviewUrl || undefined,
    isFeatured: Boolean(data.isFeatured),
    isNewArrival: Boolean(data.isNewArrival),
    isBestSeller: Boolean(data.isBestSeller),
    isOffer: Boolean(data.isOffer),
    isPublished: data.isPublished !== false,
    viewsCount: 0,
    cartAddCount: 0,
    orderCount: 0,
    unitsSoldCount: 0,
    revenue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = db.addProduct(newProd, adminEmail);
  res.status(201).json(created);
});

app.put('/api/admin/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const adminEmail = req.adminUser?.email || 'admin';

  const updated = db.updateProduct(id, updates, adminEmail);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(updated);
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminEmail = req.adminUser?.email || 'admin';

  const success = db.deleteProduct(id, adminEmail);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ success: true });
});

// Admin Categories CRUD
app.post('/api/admin/categories', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, description, image, displayOrder } = req.body;
  const adminEmail = req.adminUser?.email || 'admin';

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    image: image || '',
    displayOrder: displayOrder || 99,
    isActive: true,
  };

  const created = db.addCategory(newCat, adminEmail);
  res.status(201).json(created);
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const adminEmail = req.adminUser?.email || 'admin';

  const updated = db.updateCategory(id, updates, adminEmail);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminEmail = req.adminUser?.email || 'admin';

  const deleted = db.deleteCategory(id, adminEmail);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// Admin Hero Slides
app.put('/api/admin/hero-slides', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { slides } = req.body;
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: 'Slides array required' });
  }
  const adminEmail = req.adminUser?.email || 'admin';
  db.updateHeroSlides(slides, adminEmail);
  res.json({ success: true, slides });
});

// Admin Banners
app.put('/api/admin/banners', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { banners } = req.body;
  if (!Array.isArray(banners)) {
    return res.status(400).json({ error: 'Banners array required' });
  }
  const adminEmail = req.adminUser?.email || 'admin';
  db.updateBanners(banners, adminEmail);
  res.json({ success: true, banners });
});

// Admin Coupons CRUD
app.get('/api/admin/coupons', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getCoupons());
});

app.post('/api/admin/coupons', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const coupon = req.body;
  const adminEmail = req.adminUser?.email || 'admin';
  const created = db.addCoupon(coupon, adminEmail);
  res.status(201).json(created);
});

app.delete('/api/admin/coupons/:code', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  const adminEmail = req.adminUser?.email || 'admin';
  const deleted = db.deleteCoupon(code, adminEmail);
  res.json({ success: deleted });
});

// Admin Settings (Payment, Delivery, Developer Profile, Brand Logo)
app.get('/api/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/admin/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const adminEmail = req.adminUser?.email || 'admin';
  const updated = db.updateSettings(updates, adminEmail);
  res.json({ success: true, settings: updated });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAuditLogs());
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ RAW BY ZIFAT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
