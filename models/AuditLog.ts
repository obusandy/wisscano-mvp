import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export const AUDIT_ACTIONS = [
  "STATUS_CHANGE",
  "UPDATE",
  "CANCEL",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog extends Document {
  requestId: Types.ObjectId;
  action: AuditAction;
  field: string;
  previousValue: string;
  newValue: string;
  changedBy: Types.ObjectId;
  changedByEmail: string;
  changedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  requestId: {
    type: Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true,
  },
  action: {
    type: String,
    enum: AUDIT_ACTIONS,
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  previousValue: {
    type: String,
    default: "",
  },
  newValue: {
    type: String,
    default: "",
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  changedByEmail: {
    type: String,
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});


AuditLogSchema.index({ requestId: 1, changedAt: -1 });

export default (models.AuditLog as mongoose.Model<IAuditLog>) ||
  model<IAuditLog>("AuditLog", AuditLogSchema);