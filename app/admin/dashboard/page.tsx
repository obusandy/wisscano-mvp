import { requireAdminSession } from "@/lib/session";
import { listServiceRequests } from "@/lib/requests-service";
import { AdminHeader } from "@/components/admin/admin-header";
import { RequestsTable } from "@/components/admin/requests-table";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;

  const status =
    typeof params.status === "string" ? params.status : undefined;
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? params.page : "1";

  const { items, pagination } = await listServiceRequests({
    status,
    search,
    page,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        adminName={session.user?.name ?? "Admin"}
        adminEmail={session.user?.email ?? ""}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">
            Service Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, search, and manage incoming service requests.
          </p>
        </div>

        <RequestsTable
          items={items}
          pagination={pagination}
          currentStatus={status}
          currentSearch={search}
        />
      </main>
    </div>
  );
}
