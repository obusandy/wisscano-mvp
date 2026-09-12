import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";
import AuditLog from "@/models/AuditLog";
import { diffFields, recordAudit } from "@/lib/audit";
import type { UpdateRequestInput } from "@/lib/validations";

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export async function getRequestById(id: string) {
  await connectDB();
  const doc = await ServiceRequest.findById(id).lean();
  if (!doc) return null;

  return {
    _id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    categoryNameSnapshot: doc.categoryNameSnapshot,
    description: doc.description,
    preferredContact: doc.preferredContact,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getAuditHistory(requestId: string) {
  await connectDB();
  const logs = await AuditLog.find({ requestId })
    .sort({ changedAt: -1 })
    .lean();

  return logs.map((log) => ({
    _id: String(log._id),
    action: log.action,
    field: log.field,
    previousValue: log.previousValue,
    newValue: log.newValue,
    changedByEmail: log.changedByEmail,
    changedAt: log.changedAt.toISOString(),
  }));
}

/**
 * Updates a service request and records an audit entry for each
 * field that actually changed. The "before" state is read fresh
 * from the database (never trusted from the client), so the diff
 * and the audit trail are always accurate to what really happened.
 */
export async function updateServiceRequest(
  id: string,
  updates: UpdateRequestInput,
  adminId: string,
  adminEmail: string
) {
  await connectDB();

  const existing = await ServiceRequest.findById(id);
  if (!existing) {
    return { notFound: true as const };
  }

  const before: Record<string, unknown> = {
    status: existing.status,
    fullName: existing.fullName,
    email: existing.email,
    phone: existing.phone,
    description: existing.description,
  };

  const changes = diffFields(before, updates);

  if (changes.length === 0) {
    return { notFound: false as const, updated: existing, changes: [] };
  }

  Object.assign(existing, updates);
  await existing.save();

  for (const change of changes) {
    await recordAudit({
      requestId: existing._id,
      action: change.field === "status" ? "STATUS_CHANGE" : "UPDATE",
      field: change.field,
      previousValue: change.previousValue,
      newValue: change.newValue,
      changedBy: adminId,
      changedByEmail: adminEmail,
    });
  }

  return { notFound: false as const, updated: existing, changes };
}

/**
 * Soft-cancel: sets status to CANCELLED rather than deleting the
 * document. Preserves referential integrity for the audit trail
 * and matches real-world practice of retaining service records.
 */
export async function cancelServiceRequest(
  id: string,
  adminId: string,
  adminEmail: string
) {
  await connectDB();

  const existing = await ServiceRequest.findById(id);
  if (!existing) {
    return { notFound: true as const };
  }

  if (existing.status === "CANCELLED") {
    return { notFound: false as const, alreadyCancelled: true as const };
  }

  const previousStatus = existing.status;
  existing.status = "CANCELLED";
  await existing.save();

  await recordAudit({
    requestId: existing._id,
    action: "CANCEL",
    field: "status",
    previousValue: previousStatus,
    newValue: "CANCELLED",
    changedBy: adminId,
    changedByEmail: adminEmail,
  });

  return { notFound: false as const, alreadyCancelled: false as const };
}
