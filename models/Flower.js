// models/Flower.js
import mongoose from "mongoose"

const EmotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
)

const SizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
    height: { type: String, required: true },
    diameter: { type: String, required: true },
  },
  { _id: false }
)

const SeoSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
  },
  { _id: false }
)

const FlowerSchema = new mongoose.Schema(
  {
    // Identifiants
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },

    // Descriptions
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },

    // Prix
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: null },
    currency: { type: String, default: "MAD" },

    // Stock & métadonnées
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },

    // Catégorisation (reprise exacte de data.js)
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: null, index: true },
    flowerType: { type: String, default: "composition" },

    // Tags et occasions (arrays simples)
    tags: [{ type: String }],
    occasions: [{ type: String, index: true }],

    // Objets complexes
    emotions: [EmotionSchema],
    sizes: [SizeSchema],
    colors: [{ type: String }],

    // Images (stockage Cloudinary)
    images: [{ type: String }], // URLs publiques Cloudinary
    imagePublicIds: [{ type: String }], // Pour suppression future

    // SEO
    seo: SeoSchema,

    // Timestamps Mongoose
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
)

// Index composite pour recherche rapide
FlowerSchema.index({ name: "text", shortDescription: "text", tags: "text" })

// Middleware pre-save pour générer le slug si absent
FlowerSchema.pre("save", async function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name)
  }
})

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const Flower = mongoose.models.Flower || mongoose.model("Flower", FlowerSchema)
export default Flower