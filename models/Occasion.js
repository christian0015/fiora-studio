// models/Occasion.js
import mongoose from "mongoose"

const OccasionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    longDesc: { type: String, required: true },
    accent: { type: String, default: "#c4857a" },
    bgGradient: { type: String, required: true },
    count: { type: Number, default: 0 },
    emotions: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

export const Occasion = mongoose.models.Occasion || mongoose.model("Occasion", OccasionSchema)
export default Occasion