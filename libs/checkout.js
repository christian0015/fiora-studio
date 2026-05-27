// libs/checkout.js
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Flora Studio — checkout.js                                 ║
 * ║  Config statique + helpers async pour les commandes         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Les valeurs STATIQUES (comptes, règles) sont exportées directement.
 * Note : si vous souhaitez rendre les infos bancaires modifiables
 * depuis un dashboard, remplacez ces constantes par un fetch sur
 * /api/settings et stockez-les dans une collection MongoDB "Settings".
 * Pour l'instant, la config est en dur ici pour simplicité.
 */

// ============================================================
// CONTACT & PAIEMENT — valeurs modifiables ici
// ============================================================

/** Numéro WhatsApp du propriétaire (sans +) */
export const OWNER_WHATSAPP = "212600954099"

/** Informations Western Union */
export const WESTERN_UNION_INFO = {
  fullName:    "Zakaria Elmalhi",
  phone:       "+212600954099",
  receiveMode: "Cash Pick-up",
}

/** Informations virement bancaire */
export const BANK_TRANSFER_INFO = {
  bank:        "Société Générale",
  accountName: "ZAKARIA EL MALIHI",
  rib:         "022450000094002874047153",
  iban:        "MA64022450000094002874047153",
  whatsapp:    "06-00-95-40-99",
}

// ============================================================
// MÉTHODES DE PAIEMENT DISPONIBLES
// Mettre enabled: false pour masquer une option côté client
// ============================================================
export const PAYMENT_METHODS = [
  {
    id:      "cash_on_delivery",
    enabled: true,
  },
  {
    id:      "bank_transfer",
    enabled: true,
  },
  {
    id:      "western_union",
    enabled: true,
  },
  {
    id:      "whatsapp",
    enabled: true,
  },
]

/** Retourne les méthodes actives (enabled: true) */
export function getEnabledPaymentMethods() {
  return PAYMENT_METHODS.filter(m => m.enabled)
}

/**
 * Vérifie si le paiement à la livraison est disponible
 * (aucune limite de montant)
 */
export function isCODAvailable() {
  const cod = PAYMENT_METHODS.find(m => m.id === "cash_on_delivery")
  return !!(cod?.enabled)
}

// ============================================================
// MÉTHODES DE LIVRAISON
// ============================================================
export const SHIPPING_METHODS = [
  {
    id:          "casablanca_free",
    city:        "Casablanca",
    label:       { fr: "Casablanca — Livraison gratuite", en: "Casablanca — Free delivery", ar: "الدار البيضاء — توصيل مجاني" },
    fee:         0,
    note:        { fr: "Livraison gratuite · Même jour avant 17h", en: "Free delivery · Same day before 5pm", ar: "توصيل مجاني · نفس اليوم قبل الساعة 5" },
    enabled:     true,
  },
  {
    id:          "casablanca_paid",
    city:        "Casablanca",
    label:       { fr: "Casablanca — Zone éloignée (+5 km)", en: "Casablanca — Far zone (+5 km)", ar: "الدار البيضاء — منطقة بعيدة (+5 كم)" },
    fee:         35,
    note:        { fr: "35 DH pour les zones au-delà de 5 km", en: "35 DH for areas beyond 5 km", ar: "35 درهم للمناطق التي تتجاوز 5 كم" },
    enabled:     true,
  },
  {
    id:          "marrakech",
    city:        "Marrakech",
    label:       { fr: "Marrakech — Livraison rapide", en: "Marrakech — Fast delivery", ar: "مراكش — توصيل سريع" },
    fee:         35,
    note:        { fr: "Frais variables selon la distance", en: "Fees vary based on distance", ar: "الرسوم تختلف حسب المسافة" },
    enabled:     true,
  },
]

export function getEnabledShippingMethods() {
  return SHIPPING_METHODS.filter(m => m.enabled)
}

export function getShippingFee(methodId) {
  return SHIPPING_METHODS.find(m => m.id === methodId)?.fee ?? 0
}

// ============================================================
// TRADUCTIONS (i18n statique checkout)
// ============================================================
export const CHECKOUT_I18N = {
  fr: {
    dir: "ltr",
    cart:          "Votre panier",
    articles:      (n) => `${n} article${n > 1 ? "s" : ""}`,
    subtotal:      "Sous-total",
    delivery:      "Livraison",
    free:          "Gratuite",
    total:         "Total",
    orderMethod:   "Comment souhaitez-vous commander ?",
    shippingMethod:"Méthode de livraison",
    paymentMethod: "Méthode de paiement",
    firstName:     "Prénom",
    lastName:      "Nom",
    email:         "Email",
    phone:         "Téléphone",
    address:       "Adresse de livraison",
    note:          "Note (optionnel)",
    notePlaceholder:"Un message pour le destinataire, une heure préférée…",
    confirm:       (total) => `Confirmer la commande — ${total}`,
    confirmWa:     "Commander via WhatsApp",
    chooseMethod:  "Choisissez un mode de commande",
    orderEmpty:    "Votre panier est vide",
    orderEmptySub: "Découvrez nos bouquets et trouvez celui qui exprime ce que vous ressentez.",
    explore:       "Explorer la boutique →",
    orderReceived: "Commande reçue",
    orderConfirmed:"Nous vous contacterons très bientôt pour confirmer la livraison.",
    backHome:      "Retour à l'accueil →",
    clearCart:     "Vider le panier",
    deliveryDeadline: "⚠️ Commandes après 18h30 → livraison le lendemain",
    paymentInstructions: {
      western_union: `
Pour payer via Western Union :
1. Ouvrez l'application Western Union ou rendez-vous dans une agence.
2. Entrez les informations de transfert :
   Nom : Zakaria Elmalhi | Tél : +212600954099
3. ⚠️ Lors du choix du mode de réception, sélectionnez « Retrait d'espèces » (Cash Pick-up).
4. Une fois le transfert effectué, envoyez-nous le code MTCN (numéro de suivi) pour valider votre commande.
Une copie de ces instructions vous sera envoyée par email après la commande.`,
      bank_transfer: `
Virement bancaire — Société Générale :
• Titulaire : ZAKARIA EL MALIHI
• RIB : 022450000094002874047153
• IBAN : MA64022450000094002874047153
Pour toute question, contactez-nous sur WhatsApp : 06-00-95-40-99
Une copie de ces instructions vous sera envoyée par email après la commande.`,
      cash_on_delivery: `
Paiement en cash à la réception de votre commande.
Une copie de ces instructions vous sera envoyée par email après la commande.`,
    },
    paymentLabels: {
      cash_on_delivery: "Paiement à la livraison",
      bank_transfer:    "Virement bancaire",
      western_union:    "Western Union",
      whatsapp:         "Commander via WhatsApp",
    },
    paymentSubs: {
      cash_on_delivery: "Payez en cash à réception · Casablanca",
      bank_transfer:    "Société Générale · Instructions envoyées par email",
      western_union:    "Transfert Cash Pick-up · MTCN requis",
      whatsapp:         "On s'occupe de tout avec vous directement",
    },
  },

  en: {
    dir: "ltr",
    cart:          "Your cart",
    articles:      (n) => `${n} item${n > 1 ? "s" : ""}`,
    subtotal:      "Subtotal",
    delivery:      "Delivery",
    free:          "Free",
    total:         "Total",
    orderMethod:   "How would you like to order?",
    shippingMethod:"Shipping method",
    paymentMethod: "Payment method",
    firstName:     "First name",
    lastName:      "Last name",
    email:         "Email",
    phone:         "Phone",
    address:       "Delivery address",
    note:          "Note (optional)",
    notePlaceholder:"A message for the recipient, a preferred time…",
    confirm:       (total) => `Confirm order — ${total}`,
    confirmWa:     "Order via WhatsApp",
    chooseMethod:  "Choose a payment method",
    orderEmpty:    "Your cart is empty",
    orderEmptySub: "Discover our bouquets and find the one that expresses what you feel.",
    explore:       "Explore the shop →",
    orderReceived: "Order received",
    orderConfirmed:"We will contact you shortly to confirm delivery.",
    backHome:      "Back to home →",
    clearCart:     "Clear cart",
    deliveryDeadline: "⚠️ Orders after 6:30 PM → next day delivery",
    paymentInstructions: {
      western_union: `
How to pay via Western Union:
1. Open the Western Union app or visit a local branch.
2. Enter the transfer details: Name: Zakaria Elmalhi | Phone: +212600954099
3. ⚠️ When asked how I should receive the money, select "Cash Pick-up".
4. Once sent, share the MTCN (tracking number) with us to validate your order.
You will get a copy of these instructions to your email after placing an order.`,
      bank_transfer: `
Bank transfer — Société Générale:
• Account holder: ZAKARIA EL MALIHI
• RIB: 022450000094002874047153
• IBAN: MA64022450000094002874047153
For more information contact us on WhatsApp: 06-00-95-40-99
You will get a copy of these instructions to your email after placing an order.`,
      cash_on_delivery: `
Pay cash upon reception of your order.
You will get a copy of these instructions to your email after placing an order.`,
    },
    paymentLabels: {
      cash_on_delivery: "Cash on delivery",
      bank_transfer:    "Bank transfer",
      western_union:    "Western Union",
      whatsapp:         "Order via WhatsApp",
    },
    paymentSubs: {
      cash_on_delivery: "Pay cash on receipt · Casablanca",
      bank_transfer:    "Société Générale · Instructions sent by email",
      western_union:    "Cash Pick-up transfer · MTCN required",
      whatsapp:         "We handle everything with you directly",
    },
  },

  ar: {
    dir: "rtl",
    cart:          "سلة التسوق",
    articles:      (n) => `${n} منتج${n > 1 ? "ات" : ""}`,
    subtotal:      "المجموع الفرعي",
    delivery:      "التوصيل",
    free:          "مجاني",
    total:         "المجموع",
    orderMethod:   "كيف تريد الطلب؟",
    shippingMethod:"طريقة الشحن",
    paymentMethod: "طريقة الدفع",
    firstName:     "الاسم الأول",
    lastName:      "اسم العائلة",
    email:         "البريد الإلكتروني",
    phone:         "الهاتف",
    address:       "عنوان التسليم",
    note:          "ملاحظة (اختياري)",
    notePlaceholder:"رسالة للمستلم، وقت مفضل…",
    confirm:       (total) => `تأكيد الطلب — ${total}`,
    confirmWa:     "الطلب عبر واتساب",
    chooseMethod:  "اختر طريقة الدفع",
    orderEmpty:    "سلة التسوق فارغة",
    orderEmptySub: "اكتشف باقاتنا وابحث عن التي تعبر عما تشعر به.",
    explore:       "← استكشاف المتجر",
    orderReceived: "تم استلام الطلب",
    orderConfirmed:"سنتواصل معك قريباً لتأكيد التسليم.",
    backHome:      "← العودة إلى الرئيسية",
    clearCart:     "إفراغ السلة",
    deliveryDeadline: "⚠️ الطلبات بعد الساعة 6:30 مساءً → التسليم في اليوم التالي",
    paymentInstructions: {
      western_union: `
كيفية الدفع عبر Western Union:
١. افتح تطبيق Western Union أو زر أحد الفروع.
٢. أدخل بيانات التحويل: الاسم: Zakaria Elmalhi | الهاتف: +212600954099
٣. ⚠️ عند اختيار طريقة الاستلام، حدد خيار "استلام نقدي" (Cash Pick-up).
٤. بعد التحويل، أرسل لنا رمز MTCN (رقم التتبع) لتأكيد طلبك.
ستصلك نسخة من هذه التعليمات عبر البريد الإلكتروني بعد تقديم الطلب.`,
      bank_transfer: `
تحويل بنكي — Société Générale:
• صاحب الحساب: ZAKARIA EL MALIHI
• RIB: 022450000094002874047153
• IBAN: MA64022450000094002874047153
للمزيد من المعلومات تواصل معنا على واتساب: 06-00-95-40-99
ستصلك نسخة من هذه التعليمات عبر البريد الإلكتروني بعد تقديم الطلب.`,
      cash_on_delivery: `
الدفع نقداً عند استلام طلبك.
ستصلك نسخة من هذه التعليمات عبر البريد الإلكتروني بعد تقديم الطلب.`,
    },
    paymentLabels: {
      cash_on_delivery: "الدفع عند الاستلام",
      bank_transfer:    "تحويل بنكي",
      western_union:    "ويسترن يونيون",
      whatsapp:         "الطلب عبر واتساب",
    },
    paymentSubs: {
      cash_on_delivery: "ادفع نقداً عند الاستلام · الدار البيضاء",
      bank_transfer:    "Société Générale · التعليمات ترسل بالبريد",
      western_union:    "تحويل Cash Pick-up · رمز MTCN مطلوب",
      whatsapp:         "نتولى كل شيء معك مباشرة",
    },
  },
}

export function getI18n(locale = "fr") {
  return CHECKOUT_I18N[locale] ?? CHECKOUT_I18N.fr
}

// ============================================================
// RÉFÉRENCE COMMANDE
// ============================================================
export function generateOrderReference() {
  const date = new Date()
  const y    = date.getFullYear()
  const m    = String(date.getMonth() + 1).padStart(2, "0")
  const d    = String(date.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `FS-${y}${m}${d}-${rand}`
}

// ============================================================
// API helpers — ASYNC
// ============================================================
const API_BASE = "/api"

async function fetchAPI(endpoint, options = {}) {
  let url = `${API_BASE}${endpoint}`
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    url = `${base}${url}`
  }
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || "Checkout API request failed")
  }
  return res.json()
}

/**
 * Créer une commande
 * @param {Object} orderData
 * @returns {Promise<Order>}
 */
export async function createOrder(orderData) {
  return fetchAPI("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  })
}

/**
 * Récupérer une commande par référence ou ID
 */
export async function getOrder(idOrRef) {
  return fetchAPI(`/orders/${idOrRef}`)
}

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(idOrRef, status, adminNote = "") {
  return fetchAPI(`/orders/${idOrRef}`, {
    method: "PUT",
    body: JSON.stringify({ status, adminNote }),
  })
}

/**
 * Lister les commandes avec filtres
 */
export async function listOrders({ page = 1, perPage = 20, status = "", from = "", to = "" } = {}) {
  const p = new URLSearchParams()
  if (page > 1)  p.append("page", page)
  p.append("perPage", perPage)
  if (status) p.append("status", status)
  if (from)   p.append("from", from)
  if (to)     p.append("to", to)
  return fetchAPI(`/orders?${p.toString()}`)
}

/**
 * Chiffre d'affaires du mois courant (ou d'une période)
 * @param {{ from?: string, to?: string, status?: string[] }} opts
 */
export async function getRevenue({ from, to, status } = {}) {
  const p = new URLSearchParams({ aggregate: "revenue" })
  if (from)   p.append("from", from)
  if (to)     p.append("to", to)
  if (status) status.forEach(s => p.append("status", s))
  return fetchAPI(`/orders?${p.toString()}`)
}