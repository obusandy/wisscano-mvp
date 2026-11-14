import mongoose, { Schema, models, model } from "mongoose";

export const SECTORS = [
  { slug: "ict-digital", label: "ICT & Digital" },
  { slug: "facility-tech", label: "Facility Tech" },
  { slug: "power-energy", label: "Power & Energy" },
] as const;

export type SectorSlug = (typeof SECTORS)[number]["slug"];

const CatalogItemSchema = new Schema(
  {
    type: { type: String, enum: ["product", "service"], required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    brand: { type: String },            // HP, Logitech, Microsoft, Kaspersky...
    category: { type: String },         // Laptops, Peripherals, Licences...
    image: { type: String },
    price: { type: Number },            // leave empty for services
    currency: { type: String, default: "KES" },
    sectorTags: {
      type: [String],
      enum: SECTORS.map((s) => s.slug),
      default: [],
      index: true,
    },
    order: { type: Number, default: 0 }, // for services: 1 to 6
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.CatalogItem || model("CatalogItem", CatalogItemSchema);