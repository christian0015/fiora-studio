// models/Order.js
import mongoose from "mongoose"

const OrderItemSchema = new mongoose.Schema(
  {
    flowerId:    { type: String, required: true },
    slug:        { type: String, required: true },
    name:        { type: String, required: true },
    image:       { type: String, default: "" },
    price:       { type: Number, required: true },
    qty:         { type: Number, required: true, min: 1 },
    size:        { type: String, default: null },
    sizeHeight:  { type: String, default: null },
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    // ── Référence humaine ──────────────────────────────────────
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format : FS-YYYYMMDD-XXXX  (généré avant save)
    },

    // ── Client ─────────────────────────────────────────────────
    customer: {
      firstName:  { type: String, default: "" },
      lastName:   { type: String, default: "" },
      fullName:   { type: String, default: "" }, // fallback si non décomposé
      email:      { type: String, default: "" },
      phone:      { type: String, default: "" },
      address:    { type: String, default: "" },
      city:       { type: String, default: "Casablanca" },
      locale:     { type: String, default: "fr" }, // fr | en | ar
    },

    // ── Articles ────────────────────────────────────────────────
    items: [OrderItemSchema],

    // ── Montants ────────────────────────────────────────────────
    subtotal:      { type: Number, required: true },
    deliveryFee:   { type: Number, default: 0 },
    total:         { type: Number, required: true },
    currency:      { type: String, default: "MAD" },

    // ── Livraison ───────────────────────────────────────────────
    shippingMethod: {
      type: String,
      // IDs from checkout.js SHIPPING_METHODS
      enum: ["casablanca_short", "casablanca_long", "outside_casablanca", "other"],
      default: "casablanca_short",
    },

    // ── Paiement ────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      // IDs from checkout.js PAYMENT_METHODS
      enum: ["cash_on_delivery", "bank_transfer", "western_union", "whatsapp"],
      required: true,
    },
    paymentRef: { type: String, default: "" }, // MTCN WU, RIB, etc.

    // ── Statut ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },

    // ── Notes ───────────────────────────────────────────────────
    note:       { type: String, default: "" },
    adminNote:  { type: String, default: "" },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)

// Index pour stats mensuelles
OrderSchema.index({ createdAt: -1, status: 1 })
OrderSchema.index({ "customer.email": 1 })

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema)
export default Order