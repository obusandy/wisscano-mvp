import { Schema, models, model } from "mongoose";

const QuoteRequestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        brand: { type: String },
        price: { type: Number, default: 0 },
        quantity: { type: Number, required: true, min: 1 },
        note: { type: String, default: "" },
      },
    ],
    emailSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export default models.QuoteRequest || model("QuoteRequest", QuoteRequestSchema);