import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAdminSession } from "@/lib/session";
import {
  isValidObjectId,
  getRequestById,
  getAuditHistory,
} from "@/lib/request-detail-service";
import { AdminHeader } from "@/components/admin/admin-header";
import { RequestActions } from "@/components/admin/request-actions";
import { AuditTrail } from "@/components/admin/audit-trail";
import { Badge } from "@/components/ui/badge";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  const [request, auditHistory] = await Promise.all([
    getRequestById(id),
    getAuditHistory(id),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        adminName={session.user?.name ?? "Admin"}
        adminEmail={session.user?.email ?? ""}
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/admin/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              {request.fullName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant="outline">{request.status.replace("_", " ")}</Badge>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Email
            </p>
            <p className="text-sm text-slate-900">{request.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Phone
            </p>
            <p className="text-sm text-slate-900">{request.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Service
            </p>
            <p className="text-sm text-slate-900">
              {request.categoryNameSnapshot}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Preferred Contact
            </p>
            <p className="text-sm text-slate-900">
              {request.preferredContact}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-slate-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
              {request.description}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <RequestActions
            requestId={request._id}
            currentStatus={request.status}
          />
        </div>

        <AuditTrail entries={auditHistory} />
      </main>
    </div>
  );
}
