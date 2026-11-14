import { Schema, models, model } from "mongoose";

const CatalogImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.CatalogImage || model("CatalogImage", CatalogImageSchema);