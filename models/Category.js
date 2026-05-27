// models/Category.js
import mongoose from "mongoose"

const SubcategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
)

const CategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "❀" },
    subcategories: [SubcategorySchema],
    order: { type: Number, default: 0 }, // Pour ordre d'affichage
  },
  {
    timestamps: true,
  }
)

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema)
export default Category