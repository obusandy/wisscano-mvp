import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REQUEST_STATUSES } from "@/lib/request-constants";
import type { ServiceRequestDTO } from "@/lib/requests-service";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEWING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

function buildPageLink(
  page: number,
  status?: string,
  search?: string
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  return `/admin/dashboard?${params.toString()}`;
}

export function RequestsTable({
  items,
  pagination,
  currentStatus,
  currentSearch,
}: {
  items: ServiceRequestDTO[];
  pagination: { page: number; totalPages: number; total: number };
  currentStatus?: string;
  currentSearch?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label
              htmlFor="search"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Search
            </label>
            <Input
              id="search"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search name, email, or description..."
              className="h-10"
            />
          </div>

          <div className="w-52">
            <label
              htmlFor="status"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={currentStatus ?? ""}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">All statuses</option>
              {REQUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="h-10">
            Apply
          </Button>

          {(currentStatus || currentSearch) && (
            <Link
              href="/admin/dashboard"
              className="text-sm text-slate-500 underline"
            >
              Clear filters
            </Link>
          )}
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No requests found.
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{item.fullName}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {item.categoryNameSnapshot}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[item.status]}
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/requests/${item._id}`}
                    className="text-sm font-medium text-emerald-700 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
        <p>
          Page {pagination.page} of {pagination.totalPages} ·{" "}
          {pagination.total} total
        </p>
        <div className="flex gap-2">
          {pagination.page > 1 && (
            <Link
              href={buildPageLink(
                pagination.page - 1,
                currentStatus,
                currentSearch
              )}
            >
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          {pagination.page < pagination.totalPages && (
            <Link
              href={buildPageLink(
                pagination.page + 1,
                currentStatus,
                currentSearch
              )}
            >
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
