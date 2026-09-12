import AuditLog from "@/models/AuditLog";
import type { Types } from "mongoose";

type AuditEntry = {
  requestId: Types.ObjectId | string;
  action: "STATUS_CHANGE" | "UPDATE" | "CANCEL";
  field: string;
  previousValue: string;
  newValue: string;
  changedBy: Types.ObjectId | string;
  changedByEmail: string;
};

/**
 * Writes a single audit log entry. Failures here are logged but do not
 * throw — the underlying data change has already been committed by the
 * time this is called, and an audit-logging failure should not roll
 * back or block an admin's legitimate action. This is a deliberate MVP
 * tradeoff; production would wrap both writes in a single transaction.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await AuditLog.create(entry);
  } catch (error) {
    console.error("Failed to write audit log entry:", error, entry);
  }
}

/**
 * Compares an existing document against incoming update fields and
 * returns only the fields that actually changed, with before/after
 * values as strings. This is computed server-side from the trusted
 * database state — never from client-supplied "previous value" data,
 * which could be forged.
 */
export function diffFields(
  before: Record<string, unknown>,
  updates: Record<string, unknown>
): Array<{ field: string; previousValue: string; newValue: string }> {
  const changes: Array<{
    field: string;
    previousValue: string;
    newValue: string;
  }> = [];

  for (const [field, newValue] of Object.entries(updates)) {
    if (newValue === undefined) continue;

    const previousValue = before[field];
    const prevStr = String(previousValue ?? "");
    const newStr = String(newValue ?? "");

    if (prevStr !== newStr) {
      changes.push({ field, previousValue: prevStr, newValue: newStr });
    }
  }

  return changes;
}
