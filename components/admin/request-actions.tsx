"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { REQUEST_STATUSES } from "@/lib/request-constants";

export function RequestActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveStatus() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update status.");
        return;
      }

      setMessage(
        data.changesApplied > 0
          ? "Status updated successfully."
          : "No changes to apply — status is already set to this value."
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelRequest() {
    if (!confirm("Cancel this request? This action can be reviewed in the audit trail.")) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to cancel request.");
        return;
      }

      setMessage(data.message);
      setStatus("CANCELLED");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Update Status
      </h3>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={saving || status === "CANCELLED"}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>

        <Button
          type="button"
          onClick={saveStatus}
          disabled={saving || status === currentStatus}
          size="sm"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save
        </Button>

        {status !== "CANCELLED" && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelRequest}
            disabled={cancelling}
            size="sm"
            className="ml-auto border-red-200 text-red-700 hover:bg-red-50"
          >
            {cancelling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <XCircle className="size-4" />
            )}
            Cancel Request
          </Button>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-emerald-700">{message}</p>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
