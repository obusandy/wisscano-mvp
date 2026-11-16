"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import { SECTORS } from "@/lib/catalogue";

type Item = {
  _id: string;
  type: "product" | "service";
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  category?: string;
  image?: string;
  price?: number;
  currency?: string;
  sectorTags: string[];
  order: number;
  active: boolean;
};

type Form = {
  type: "product" | "service";
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  order: string;
  image: string;
  sectorTags: string[];
  active: boolean;
};

const empty: Form = {
  type: "product",
  name: "",
  brand: "",
  category: "",
  description: "",
  price: "",
  order: "",
  image: "",
  sectorTags: [],
  active: true,
};

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:text-sm";

// Shrinks a picture to max 1000px before upload
async function compress(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read the picture.");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not shrink the picture."))),
      "image/webp",
      0.85
    )
  );
  return new File([blob], "image", { type: blob.type });
}

export default function CatalogueManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [query, setQuery] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSector = (slug: string) =>
    setForm((f) => ({
      ...f,
      sectorTags: f.sectorTags.includes(slug)
        ? f.sectorTags.filter((s) => s !== slug)
        : [...f.sectorTags, slug],
    }));

  // Lock page scroll and allow Escape while the panel is open
  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [panelOpen]);

  // Clear the "saved" message after a few seconds
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  // Category suggestions: from the chosen sectors, plus ones already used
  const suggestions = useMemo(() => {
    const chosen = SECTORS.filter(
      (s) => form.sectorTags.length === 0 || form.sectorTags.includes(s.slug)
    ).flatMap((s) => [...s.categories]);
    const used = items.map((i) => i.category).filter(Boolean) as string[];
    return Array.from(new Set([...chosen, ...used]));
  }, [form.sectorTags, items]);

  const closePanel = () => {
    setPanelOpen(false);
    setEditingId(null);
    setForm(empty);
    setFormError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openNew = () => {
    setEditingId(null);
    setForm(empty);
    setFormError("");
    setPageError("");
    setPanelOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingId(item._id);
    setForm({
      type: item.type,
      name: item.name,
      brand: item.brand ?? "",
      category: item.category ?? "",
      description: item.description ?? "",
      price: item.price !== undefined ? String(item.price) : "",
      order: String(item.order ?? ""),
      image: item.image ?? "",
      sectorTags: item.sectorTags ?? [],
      active: item.active,
    });
    setFormError("");
    setPageError("");
    setPanelOpen(true);
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setFormError("");
    setUploading(true);
    try {
      const small = await compress(file);
      const body = new FormData();
      body.append("file", small);
      const res = await fetch("/api/admin/catalogue/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      set("image", data.url);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/catalogue/${editingId}` : "/api/admin/catalogue",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "Could not save.");
        return;
      }
      const saved = data.item as Item;
      setItems((prev) =>
        editingId ? prev.map((i) => (i._id === saved._id ? saved : i)) : [saved, ...prev]
      );
      setNotice(editingId ? "Changes saved." : "Item added.");
      closePanel();
    } catch {
      setFormError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: Item) => {
    setPageError("");
    const res = await fetch(`/api/admin/catalogue/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i._id === item._id ? data.item : i)));
    } else {
      setPageError(data.error ?? "Could not update.");
    }
  };

  const remove = async (item: Item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setPageError("");
    const res = await fetch(`/api/admin/catalogue/${item._id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } else {
      const data = await res.json().catch(() => ({}));
      setPageError(data.error ?? "Could not delete.");
    }
  };

  const sectorLabel = (slug: string) => SECTORS.find((s) => s.slug === slug)?.label ?? slug;

  const counts = {
    products: items.filter((i) => i.type === "product").length,
    services: items.filter((i) => i.type === "service").length,
    hidden: items.filter((i) => !i.active).length,
  };

  const q = query.trim().toLowerCase();
  const shown = items.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (sectorFilter !== "all" && !i.sectorTags.includes(sectorFilter)) return false;
    if (
      q &&
      !`${i.name} ${i.brand ?? ""} ${i.category ?? ""}`.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      on
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
    }`;

  return (
    <>
      {/* ================= Page heading ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Products & Services</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit or hide what shows on the catalogue and the products page.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={16} />
          Add item
        </button>
      </div>

      {/* ================= Counts ================= */}
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          ["Products", counts.products],
          ["Services", counts.services],
          ["Hidden", counts.hidden],
        ].map(([label, n]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
            <dt className="text-xs text-slate-500 sm:text-sm">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">{n}</dd>
          </div>
        ))}
      </dl>

      {/* ================= Messages ================= */}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          {notice}
        </p>
      )}
      {pageError && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {pageError}
        </p>
      )}

      {/* ================= Filters ================= */}
      <div className="mt-6 space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand or category"
            aria-label="Search items"
            className={`${field} pl-9`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "product", "service"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={chip(typeFilter === f)}
            >
              {f === "all" ? "All" : f === "product" ? "Products" : "Services"}
            </button>
          ))}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filter by sector"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-600"
          >
            <option value="all">All sectors</option>
            {SECTORS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= List ================= */}
      <p className="mt-6 text-sm text-slate-500">
        Showing {shown.length} of {items.length}
      </p>

      {shown.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {items.length === 0
            ? "Nothing here yet. Tap “Add item” to start."
            : "No items match your search or filters."}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {shown.map((item) => (
            <li
              key={item._id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 ${
                item.active ? "" : "bg-slate-50"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-16 sm:w-16">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-contain p-1 ${
                        item.active ? "" : "opacity-50"
                      }`}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-300">
                      {(item.brand || item.name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-semibold leading-snug text-slate-950">{item.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-slate-600">
                      {item.type}
                    </span>
                    {!item.active && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-amber-700">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {item.sectorTags.map(sectorLabel).join(" · ")}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                  {item.type === "product" && item.price ? (
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      KES {item.price.toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {item.active ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ================= Add / edit panel ================= */}
      {panelOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="panel-title">
          <button
            type="button"
            aria-label="Close panel"
            onClick={closePanel}
            className="absolute inset-0 bg-slate-950/50"
          />

          <form
            onSubmit={submit}
            className="absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 id="panel-title" className="text-lg font-semibold text-slate-950">
                {editingId ? "Edit item" : "Add new item"}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {/* Type */}
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                {(["product", "service"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`rounded-md py-2 text-sm font-semibold capitalize transition ${
                      form.type === t ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-slate-800">
                  Name
                </label>
                <input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={field}
                />
              </div>

              {form.type === "product" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="c-brand" className="mb-1.5 block text-sm font-medium text-slate-800">
                      Brand
                    </label>
                    <input
                      id="c-brand"
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      placeholder="HP, Logitech..."
                      className={field}
                    />
                  </div>
                  <div>
                    <label htmlFor="c-price" className="mb-1.5 block text-sm font-medium text-slate-800">
                      Price (KES)
                    </label>
                    <input
                      id="c-price"
                      type="number"
                      inputMode="decimal"
                      min={1}
                      step="any"
                      required
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={field}
                    />
                  </div>
                </div>
              )}

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-800">Sector</legend>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((s) => {
                    const on = form.sectorTags.includes(s.slug);
                    return (
                      <label key={s.slug} className={`cursor-pointer ${chip(on)}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          onChange={() => toggleSector(s.slug)}
                        />
                        {s.label}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Pick one or more.</p>
              </fieldset>

              <div>
                <label htmlFor="c-cat" className="mb-1.5 block text-sm font-medium text-slate-800">
                  Category
                </label>
                <input
                  id="c-cat"
                  list="category-list"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Pick a suggestion or type your own"
                  className={field}
                />
                <datalist id="category-list">
                  {suggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="c-desc" className="mb-1.5 block text-sm font-medium text-slate-800">
                  Description
                </label>
                <textarea
                  id="c-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={field}
                />
              </div>

              {form.type === "service" && (
                <div>
                  <label htmlFor="c-order" className="mb-1.5 block text-sm font-medium text-slate-800">
                    Position <span className="text-slate-400">(optional, 1 shows first)</span>
                  </label>
                  <input
                    id="c-order"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.order}
                    onChange={(e) => set("order", e.target.value)}
                    className={field}
                  />
                </div>
              )}

              {/* Picture */}
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-800">Picture</span>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                        No picture
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                    />
                    {uploading && <p className="text-xs text-slate-500">Uploading…</p>}
                    {form.image && !uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          set("image", "");
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove picture
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Show on the website
              </label>
            </div>

            {/* Pinned footer */}
            <div className="border-t border-slate-200 bg-white px-5 py-4">
              {formError && (
                <p role="alert" className="mb-3 text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}