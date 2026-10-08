import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (genAIInstance) return genAIInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '' || key.length < 20) return null;
  genAIInstance = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return genAIInstance;
}

export async function handleSupportChat(message: string, history: { role: string; text: string }[] = []) {
  const trimmed = message.trim();

  // Admin access trigger check - supports /rawbyzifat and variations
  const lowerTrigger = trimmed.toLowerCase().replace(/\s+/g, '');
  if (
    lowerTrigger === '/rawbyzifat' ||
    lowerTrigger === 'rawbyzifat' ||
    trimmed === '/RAW BY ZIFAT' ||
    lowerTrigger === '/raw_by_zifat'
  ) {
    return {
      reply: '⚡ [AUTHORIZED ACCESS TRIGGER RECOGNIZED]\n\nAuthentication gateway unlocked. Proceed to the administrator portal:',
      isAdminTrigger: true,
      adminLoginUrl: '/admin/login',
    };
  }

  const settings = db.getSettings();
  const products = db.getProducts().slice(0, 8);
  const categories = db.getCategories();

  const storeContext = `
You are the official Customer Support AI for "RAW BY ZIFAT", a premium Bangladeshi clothing and fashion brand.
Brand Identity:
- Store Name: RAW BY ZIFAT
- Specialization: Premium minimalist streetwear, heavy 260 GSM oversized tees, French Terry hoodies, contemporary linen panjabi, cargo pants, vintage denim, and polo shirts. No non-clothing products.
- Tagline: "Engineered Streetwear & Modern Bangladeshi Apparel"
- Background/Aesthetic: Crisp white/off-white, modern, luxury minimalist.
- Contact: Phone: ${settings.phone}, Email: ${settings.email}, Address: ${settings.address}

Delivery Information:
- Inside Dhaka Delivery Charge: ৳${settings.deliverySettings.insideDhakaCharge} (typically 24-48 hours)
- Outside Dhaka Delivery Charge: ৳${settings.deliverySettings.outsideDhakaCharge} (typically 48-72 hours)
- Free Delivery Threshold: Free shipping for orders of ৳${settings.deliverySettings.freeDeliveryThreshold} or more across Bangladesh.

Payment Methods:
- Cash on Delivery (COD): Available for eligible clothing items (some exclusive outerwear requires prepayment).
- bKash: ${settings.paymentSettings.bkash.number} (${settings.paymentSettings.bkash.accountType}). Instructions: ${settings.paymentSettings.bkash.instructions}
- Nagad: ${settings.paymentSettings.nagad.number} (${settings.paymentSettings.nagad.accountType}). Instructions: ${settings.paymentSettings.nagad.instructions}

Ordering & Tracking:
- No customer account or registration needed! Customers can order as guests in under 60 seconds.
- Tracking: Customers can track their order anytime on the "Track Order" page using their Order ID (e.g. RBZ-XXXXX) and phone number.
- Size exchange: Supported within 3 days of delivery if unworn with original tags intact.

Categories: ${categories.map((c) => c.name).join(', ')}
Key Products currently in store:
${products.map((p) => `- ${p.name}: ৳${p.salePrice || p.price} (Sizes: ${p.sizes.join(', ')}) [COD: ${p.codAvailable ? 'Available' : 'Prepayment only'}]`).join('\n')}

Instructions:
1. Always be polite, concise, professional, and knowledgeable about fashion and the brand RAW BY ZIFAT.
2. Reply in either clean English or conversational Bengali/Banglish depending on what the customer used.
3. If they ask about delivery, payments (bKash/Nagad), sizes, or tracking, provide direct factual answers from the store configuration.
4. If they ask how to order, explain the fast guest checkout process (select size, add to cart, fill delivery address, pick COD or bKash/Nagad).
`.trim();

  const ai = getGenAI();
  if (ai) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request exceeded threshold')), 25000)
      );
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${storeContext}\n\nCustomer question: ${message}` }] },
          ],
          config: {
            maxOutputTokens: 600,
            temperature: 0.7,
          },
        }),
        timeoutPromise,
      ]);

      const replyText = response.text?.trim() || '';
      if (replyText) {
        return { reply: replyText, isAdminTrigger: false };
      }
    } catch {
      // Gracefully continue to rule-based fallback if Gemini is temporarily unavailable
    }
  }

  // Fallback Rule-Based Agent when Gemini API key is missing or offline
  const lower = trimmed.toLowerCase();

  if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('charge') || lower.includes('cost') || lower.includes('khoroch') || lower.includes('koto')) {
    return {
      reply: `🚚 Delivery Information for RAW BY ZIFAT:\n• Inside Dhaka: ৳${settings.deliverySettings.insideDhakaCharge} (takes 24–48 hours)\n• Outside Dhaka: ৳${settings.deliverySettings.outsideDhakaCharge} (takes 2–3 days)\n• Free Delivery: Enjoy FREE delivery on all orders of ৳${settings.deliverySettings.freeDeliveryThreshold} or more!`,
      isAdminTrigger: false,
    };
  }

  if (lower.includes('cod') || lower.includes('cash on delivery') || lower.includes('cash') || lower.includes('hate hate')) {
    return {
      reply: `💵 Cash on Delivery (COD) is available on most clothing items across Bangladesh. Some exclusive outerwear or limited drops require bKash/Nagad advance payment. You can verify COD availability directly on each product's page and in your cart!`,
      isAdminTrigger: false,
    };
  }

  if (lower.includes('bkash') || lower.includes('nagad') || lower.includes('pay') || lower.includes('payment') || lower.includes('taka')) {
    return {
      reply: `💳 We accept:\n1. Cash on Delivery (COD)\n2. bKash: ${settings.paymentSettings.bkash.number} (${settings.paymentSettings.bkash.accountType})\n3. Nagad: ${settings.paymentSettings.nagad.number} (${settings.paymentSettings.nagad.accountType})\n\nAfter sending money, simply enter your sender mobile number and Transaction ID (TrxID) at checkout.`,
      isAdminTrigger: false,
    };
  }

  if (lower.includes('order') || lower.includes('how to') || lower.includes('buy') || lower.includes('kinbo')) {
    return {
      reply: `🛍️ Ordering is seamless and requires NO account creation:\n1. Browse our collection and select your preferred clothing item.\n2. Choose your size (M, L, XL, XXL) and color.\n3. Click "Add to Cart" or "Buy Now".\n4. Enter your delivery address and choose Cash on Delivery or bKash/Nagad.\n5. Click "Place Order" to immediately receive your official receipt!`,
      isAdminTrigger: false,
    };
  }

  if (lower.includes('track') || lower.includes('where is') || lower.includes('status') || lower.includes('kothay')) {
    return {
      reply: `🔍 You can track your parcel in real-time on our "Track Order" page using your Order ID (received after checkout, e.g. RBZ-XXXXX) and your mobile number.`,
      isAdminTrigger: false,
    };
  }

  if (lower.includes('contact') || lower.includes('phone') || lower.includes('address') || lower.includes('location')) {
    return {
      reply: `📍 Contact RAW BY ZIFAT:\n• Hotline: ${settings.phone}\n• Email: ${settings.email}\n• Studio: ${settings.address}\n• WhatsApp: ${settings.developerProfile.whatsapp}`,
      isAdminTrigger: false,
    };
  }

  return {
    reply: `Hello! Welcome to RAW BY ZIFAT. We offer premium minimalist streetwear, heavy 260 GSM oversized tees, French Terry hoodies, and contemporary Panjabi. Feel free to ask about our clothing sizing, delivery charges (৳${settings.deliverySettings.insideDhakaCharge} inside Dhaka / ৳${settings.deliverySettings.outsideDhakaCharge} outside), Cash on Delivery, or tracking your order!`,
    isAdminTrigger: false,
  };
}
