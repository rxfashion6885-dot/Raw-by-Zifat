import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  // English letters speaking Bangla (Banglish) as requested:
  // "English basha ta Amon hobe English letter diyei likha thakbe kintu bangla kotha bolbe English letter a lekha thakbe"
  en: {
    // Top banner & Navbar
    'nav.announcement': 'SARADESH E ৳2,500 TAKAR BESHI ORDER E FREE EXPRESS SHIPPING',
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.categories': 'Category Shomuh',
    'nav.newArrivals': 'Notun Drop (New)',
    'nav.offers': 'Special Offer',
    'nav.trackOrder': 'Order Track Korun',
    'nav.searchPlaceholder': 'Hoodie, drop shoulder, t-shirt khujun...',
    'nav.support': 'Customer Care Help',
    'nav.cart': 'Bag',
    'nav.language': 'Bhasha',
    'nav.selectLanguage': 'Bhasha Poriborton Korun',
    'nav.moreOptions': 'Menu',

    // Hero & Home
    'home.shopCollection': 'Collection Ghure Dekhun',
    'home.shopNow': 'Ekhoni Kinun',
    'home.exploreCategories': 'Category Dekhun',
    'home.newArrivals': 'Notun Drop (New Arrivals)',
    'home.newArrivalsSub': 'High-density GSM combed cotton e toiri fresh streetwear drops',
    'home.bestSellers': 'Shobcheye Beshi Bikri Howa Ponno',
    'home.bestSellersSub': 'Ei shoptahir shobcheye popular trending pieces',
    'home.featured': 'Featured Ponno',
    'home.viewAll': 'Shob Dekhun',
    'home.feature1.title': 'Nationwide Cash On Delivery',
    'home.feature1.desc': 'Purno Bangladesh e hate peye taka porishodh korar nishchoyota',
    'home.feature2.title': 'Heavyweight Premium Fabric',
    'home.feature2.desc': '100% premium combed cotton, color bleed hobena',
    'home.feature3.title': 'Fast Express Delivery',
    'home.feature3.desc': 'Dhaka te 24-48 ghonta, Dhakar baire 48-72 ghonta',
    'home.feature4.title': 'Shohoj Size Exchange',
    'home.feature4.desc': 'Delivery poyar 7 diner moddhe shohoj exchange subidha',

    // Product Card & Actions
    'product.addToCart': 'Cart e Jukto Korun',
    'product.buyNow': 'Ekhoni Order Korun',
    'product.codAvailable': 'Cash On Delivery Subidha Ache',
    'product.codOnlyPrepaid': 'Advance Payment Proyojon',
    'product.inStock': 'Stock e Ache',
    'product.outOfStock': 'Stock Shesh',
    'product.sale': 'OFFER',
    'product.new': 'NOTUN',
    'product.videoReview': 'Video Review Dekhun',
    'product.selectSize': 'Size Select Korun',
    'product.viewDetails': 'Bistarito Dekhun',

    // Cart
    'cart.title': 'Apnar Bag',
    'cart.empty': 'Apnar shopping bag khali royeche',
    'cart.startShopping': 'Shopping Shuru Korun',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Delivery Charge',
    'cart.total': 'Shorbomot (Total)',
    'cart.checkout': 'Order Confirm Korun',
    'cart.freeShippingBadge': '৳2,500+ order e Free Delivery',

    // Footer & General
    'footer.about': 'RAW BY ZIFAT - Dhaka shohorer contemporary luxury streetwear brand.',
    'footer.links': 'Proyojonio Link',
    'footer.customerCare': 'Customer Care Support',
    'footer.contact': 'Jogajog Korun',
    'footer.rights': 'Shob shottwo shongrokkhito (All rights reserved).',
  },

  // Bengali script (বাংলা হরফ)
  bn: {
    // Top banner & Navbar
    'nav.announcement': 'সারাদেশে ২,৫০০ টাকার বেশি অর্ডারে ফ্রি এক্সপ্রেস ডেলিভারি',
    'nav.home': 'হোম',
    'nav.shop': 'শপ',
    'nav.categories': 'ক্যাটাগরি সমূহ',
    'nav.newArrivals': 'নতুন আগমন',
    'nav.offers': 'অফার সমূহ',
    'nav.trackOrder': 'অর্ডার ট্র্যাক করুন',
    'nav.searchPlaceholder': 'হুডি, ড্রপ শোল্ডার, টি-শার্ট খুঁজুন...',
    'nav.support': 'কাস্টমার কেয়ার',
    'nav.cart': 'কার্ট ব্যাগ',
    'nav.language': 'ভাষা',
    'nav.selectLanguage': 'ভাষা পরিবর্তন করুন',
    'nav.moreOptions': 'মেনু ও অপশন',

    // Hero & Home
    'home.shopCollection': 'কালেকশন দেখুন',
    'home.shopNow': 'এখনই কিনুন',
    'home.exploreCategories': 'ক্যাটাগরি ব্রাউজ করুন',
    'home.newArrivals': 'নতুন কালেকশন (New Drops)',
    'home.newArrivalsSub': 'উচ্চমানের জিএসএম কম্বড কটনে প্রস্তুত নতুন ড্রপস',
    'home.bestSellers': 'টপ সেলিং কালেকশন',
    'home.bestSellersSub': 'চলতি সপ্তাহের সর্বাধিক বিক্রিত পোশাকসমূহ',
    'home.featured': 'ফিচার্ড কালেকশন',
    'home.viewAll': 'সবগুলো দেখুন',
    'home.feature1.title': 'সারাদেশে ক্যাশ অন ডেলিভারি',
    'home.feature1.desc': 'পণ্য হাতে পেয়ে টাকা পরিশোধ করার পূর্ণ নিশ্চয়তা',
    'home.feature2.title': 'প্রিমিয়াম ভারী ফেব্রিক',
    'home.feature2.desc': '১০০% কম্বড কটন, কোনো রঙের ক্ষতি হবে না',
    'home.feature3.title': 'দ্রুততম ডেলিভারি',
    'home.feature3.desc': 'ঢাকায় ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৪৮-৭২ ঘণ্টা',
    'home.feature4.title': 'সহজ সাইজ এক্সচেঞ্জ',
    'home.feature4.desc': 'ডেলিভারির ৭ দিনের মধ্যে সাইজ পরিবর্তনের সুবিধা',

    // Product Card & Actions
    'product.addToCart': 'কার্টে যোগ করুন',
    'product.buyNow': 'সরাসরি অর্ডার করুন',
    'product.codAvailable': 'ক্যাশ অন ডেলিভারি সুবিধা আছে',
    'product.codOnlyPrepaid': 'অগ্রিম পেমেন্ট প্রযোজ্য',
    'product.inStock': 'স্টকে আছে',
    'product.outOfStock': 'স্টক শেষ',
    'product.sale': 'অফার',
    'product.new': 'নতুন',
    'product.videoReview': 'ভিডিও রিভিউ দেখুন',
    'product.selectSize': 'সাইজ বাছাই করুন',
    'product.viewDetails': 'বিস্তারিত দেখুন',

    // Cart
    'cart.title': 'আপনার কার্ট',
    'cart.empty': 'আপনার ব্যাগটি বর্তমানে খালি রয়েছে',
    'cart.startShopping': 'শপিং শুরু করুন',
    'cart.subtotal': 'সাবটোটাল',
    'cart.shipping': 'ডেলিভারি চার্জ',
    'cart.total': 'সর্বমোট',
    'cart.checkout': 'অর্ডার সম্পন্ন করুন',
    'cart.freeShippingBadge': '৳২,৫০০+ অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি',

    // Footer
    'footer.about': 'RAW BY ZIFAT - ঢাকার নিজস্ব সমসাময়িক প্রিমিয়াম স্ট্রিটওয়্যার ফ্যাশন ব্র্যান্ড।',
    'footer.links': 'প্রয়োজনীয় লিংক',
    'footer.customerCare': 'কাস্টমার কেয়ার',
    'footer.contact': 'যোগাযোগ',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rbz_app_language');
      if (saved === 'bn' || saved === 'en') return saved;
    }
    return 'en'; // Default to Banglish (English letters speaking Bengali) as requested
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('rbz_app_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string, fallback?: string): string => {
    const text = translations[language]?.[key] || translations['en']?.[key] || fallback || key;
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
