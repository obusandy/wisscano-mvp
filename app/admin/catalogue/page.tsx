import { requireAdminSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import CatalogItem from "@/models/CatalogItem";
import CatalogueManager from "../catalogue-manager";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminCataloguePage() {
  const session = await requireAdminSession();

  await connectDB();
  const raw = await CatalogItem.find({}).sort({ type: -1, order: 1, name: 1 }).lean();
  const items = JSON.parse(JSON.stringify(raw));

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader
        adminName={session.user?.name ?? "Admin"}
        adminEmail={session.user?.email ?? ""}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        

        <CatalogueManager initialItems={items} />
      </main>
    </div>
  );
}