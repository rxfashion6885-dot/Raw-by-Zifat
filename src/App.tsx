import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext.js';
import { CartProvider } from './context/CartContext.js';
import { AdminAuthProvider } from './context/AdminAuthContext.js';

import { Navbar } from './components/Navbar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CustomerSupportModal } from './components/CustomerSupportModal.js';
import { DeveloperProfileModal } from './components/DeveloperProfileModal.js';
import { ToastContainer } from './components/ToastContainer.js';

import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderReceiptPage } from './pages/OrderReceiptPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';

import { AdminLoginPage } from './admin/AdminLoginPage.js';
import { AdminDashboard } from './admin/AdminDashboard.js';
import { AdminOrders } from './admin/AdminOrders.js';
import { AdminProducts } from './admin/AdminProducts.js';
import { AdminCategories } from './admin/AdminCategories.js';
import { AdminHeroBanners } from './admin/AdminHeroBanners.js';
import { AdminCoupons } from './admin/AdminCoupons.js';
import { AdminSettings } from './admin/AdminSettings.js';
import { AdminAuditLogs } from './admin/AdminAuditLogs.js';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept anchor clicks for SPA feel without reloading
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('download') &&
        target.getAttribute('target') !== '_blank'
      ) {
        const url = new URL(target.href);
        // If hash only on same page with same search, let browser jump
        if (url.pathname === window.location.pathname && url.hash && url.search === window.location.search) {
          return;
        }
        e.preventDefault();
        window.history.pushState({}, '', url.pathname + url.search + url.hash);
        setCurrentPath(url.pathname);
        setCurrentSearch(url.search);
        window.scrollTo(0, 0);
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  // Route dispatcher
  const renderRoute = () => {
    // 1. Admin Routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage />;
    }
    if (currentPath === '/admin' || currentPath === '/admin/') {
      return <AdminDashboard />;
    }
    if (currentPath === '/admin/orders') {
      return <AdminOrders />;
    }
    if (currentPath === '/admin/products') {
      return <AdminProducts />;
    }
    if (currentPath === '/admin/categories') {
      return <AdminCategories />;
    }
    if (currentPath === '/admin/hero-banners') {
      return <AdminHeroBanners />;
    }
    if (currentPath === '/admin/coupons') {
      return <AdminCoupons />;
    }
    if (currentPath === '/admin/settings') {
      return <AdminSettings />;
    }
    if (currentPath === '/admin/audit-logs') {
      return <AdminAuditLogs />;
    }

    // 2. Public Store Routes
    // Product Details: /product/:slug (Deep-link requirement 14)
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').replace(/\/$/, '');
      return <ProductDetailPage slug={slug} />;
    }

    // Receipt: /receipt/:orderId
    if (currentPath.startsWith('/receipt/')) {
      const orderId = currentPath.replace('/receipt/', '').replace(/\/$/, '');
      return <OrderReceiptPage orderId={orderId} />;
    }

    // Track: /track
    if (currentPath === '/track' || currentPath === '/track/') {
      return <OrderTrackingPage />;
    }

    // Checkout: /checkout
    if (currentPath === '/checkout' || currentPath === '/checkout/') {
      return <CheckoutPage />;
    }

    // Shop Catalog: /shop
    if (currentPath === '/shop' || currentPath === '/shop/') {
      return <ShopPage key={`${currentPath}${currentSearch}`} />;
    }

    // Categories Showcase: /categories
    if (currentPath === '/categories' || currentPath === '/categories/') {
      return <CategoriesPage />;
    }

    // Category Filter: /category/:slug
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '').replace(/\/$/, '');
      return <ShopPage initialCategory={slug} key={`cat-${slug}`} />;
    }

    // Default: Home
    return <HomePage />;
  };

  return (
    <StoreProvider>
      <CartProvider>
        <AdminAuthProvider>
          <div className="min-h-screen flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
            {/* Show Public Store Navbar only on public customer routes */}
            {!isAdminRoute && <Navbar />}

            {/* Page content */}
            <main className="flex-1">{renderRoute()}</main>

            {/* Public Store Overlays & Modals */}
            {!isAdminRoute && (
              <>
                <Footer />
                <MobileBottomNav />
                <CartDrawer />
                <CustomerSupportModal />
                {/* Developer Profile Modal is disabled per user request until re-enabled */}
              </>
            )}

            <ToastContainer />
          </div>
        </AdminAuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}

export default App;
