import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ServiceCard from "@/components/ServiceCard";
import { sectorBySlug, SECTORS } from "@/lib/catalogue";
import CatalogItem from "@/models/CatalogItem";

type Item = {
  _id: string;
  type: "product" | "service";
  name: string;
  slug: string;
  description: string;
  brand?: string;
  category?: string;
  image?: string;
  price?: number;
  currency: string;
  sectorTags: string[];
  order: number;
};

// Groups items by category, keeping the order from lib/catalogue.ts
function groupByCategory(items: Item[]) {
  const order: string[] = SECTORS.flatMap((s) => [...s.categories]);
  const map = new Map<string, Item[]>();
  for (const it of items) {
    const key = it.category ?? "Other";
    map.set(key, [...(map.get(key) ?? []), it]);
  }
  return Array.from(map.entries()).sort(
    ([a], [b]) =>
      (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) -
      (order.indexOf(b) === -1 ? 999 : order.indexOf(b))
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector } = await searchParams;
  const activeSector = sectorBySlug(sector);

  await connectDB();
  const raw = await CatalogItem.find({ active: true })
    .sort({ order: 1, name: 1 })
    .lean();
  const items: Item[] = JSON.parse(JSON.stringify(raw));

  const countFor = (slug: string) =>
    items.filter((i) => i.sectorTags?.includes(slug)).length;

  // With a sector selected, keep only that sector's items
  const visible = activeSector
    ? items.filter((i) => i.sectorTags?.includes(activeSector.slug))
    : items;

  const products = visible.filter((i) => i.type === "product");
  const services = visible
    .filter((i) => i.type === "service")
    .sort((a, b) => a.order - b.order);

  const pill = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "border-[#0A63FF] bg-[#0A63FF] text-white"
        : "border-white/25 bg-white/5 text-white hover:bg-white/15"
    }`;

  return (
    <main className="bg-white text-gray-900">
      {/* ================= Hero ================= */}
      <header className="relative overflow-hidden bg-[#050B1A] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#0A63FF]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-52 -left-32 h-[26rem] w-[26rem] rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400">
            Catalogue
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {activeSector ? (
              <>
                {activeSector.label}{" "}
              </>
            ) : (
              <>
                Everything your building <span className="text-blue-400">needs.</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {activeSector
              ? `Authorized partner products and services for ${activeSector.label}.`
              : "Authorized partner products and managed services, supplied and supported by Wisscano."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className={pill(!activeSector)}>
              All
              <span className="text-xs opacity-70">{items.length}</span>
            </Link>
            {SECTORS.map((s) => (
              <Link
                key={s.slug}
                href={`/products?sector=${s.slug}`}
                className={pill(activeSector?.slug === s.slug)}
              >
                {s.label}
                <span className="text-xs opacity-70">{countFor(s.slug)}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ================= Products ================= */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {activeSector
                ? `${activeSector.label} products`
                : "Authorized partner products"}
            </h2>
            <span className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>

          {groupByCategory(products).map(([category, list]) => (
            <div key={category} className="mt-12">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0A63FF]">
                  {category}
                </h3>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p._id} item={p} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ================= Services ================= */}
      {services.length > 0 && (
        <section id="services" className="scroll-mt-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0A63FF]">
              Services
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {activeSector
                ? `${activeSector.label} services`
                : "Managed cloud, software & security services"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, idx) => (
                <ServiceCard key={s._id} item={s} number={idx + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= Nothing listed yet ================= */}
      {activeSector && products.length === 0 && services.length === 0 && (
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-xl font-semibold">
              Nothing listed yet for {activeSector.label}.
            </p>
            <p className="mt-3 text-gray-600">
              We still supply and install: {activeSector.categories.slice(0, 4).join(", ")}{" "}
              and more. Tell us what you need and we will quote it.
            </p>
            <a
              href="https://wisscano.co.ke/#contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0A63FF] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600"
            >
              Request a quote
              <ArrowRight size={14} />
            </a>
          </div>
        </section>
      )}

      {/* ================= View more ================= */}
      {activeSector && (
        <div className="flex justify-center px-4 pb-20 pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#0A63FF] px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-blue-600"
          >
            View more products & services
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </main>
  );
}