import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export const REQUEST_STATUSES = [
  "NEW",
  "REVIEWING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CONTACT_METHODS = ["EMAIL", "PHONE"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export interface IServiceRequest extends Document {
  fullName: string;
  email: string;
  phone: string;
  category: Types.ObjectId;
  categoryNameSnapshot: string;
  description: string;
  preferredContact: ContactMethod;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name is too short"],
      maxlength: [120, "Full name cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 30,
      match: [/^[0-9+\-\s()]{7,20}$/, "Invalid phone number format"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Service category is required"],
    },

    categoryNameSnapshot: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Please provide a more detailed description (min 10 characters)"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    preferredContact: {
      type: String,
      enum: {
        values: CONTACT_METHODS,
        message: "Preferred contact must be EMAIL or PHONE",
      },
      required: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "NEW",
    },
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ status: 1, createdAt: -1 });
ServiceRequestSchema.index({ email: 1 });
ServiceRequestSchema.index({
  fullName: "text",
  email: "text",
  description: "text",
});

export default (models.ServiceRequest as mongoose.Model<IServiceRequest>) ||
  model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);