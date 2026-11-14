"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | "product" | "service">("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const formTop = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSector = (slug: string) =>
    setForm((f) => ({
      ...f,
      sectorTags: f.sectorTags.includes(slug)
        ? f.sectorTags.filter((s) => s !== slug)
        : [...f.sectorTags, slug],
    }));

  // Category suggestions: from the chosen sectors, plus ones already used
  const suggestions = useMemo(() => {
    const chosen = SECTORS.filter(
      (s) => form.sectorTags.length === 0 || form.sectorTags.includes(s.slug)
    ).flatMap((s) => [...s.categories]);
    const used = items.map((i) => i.category).filter(Boolean) as string[];
    return Array.from(new Set([...chosen, ...used]));
  }, [form.sectorTags, items]);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
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
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
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
        setError(data.error ?? "Could not save.");
        return;
      }
      const saved = data.item as Item;
      setItems((prev) =>
        editingId ? prev.map((i) => (i._id === saved._id ? saved : i)) : [saved, ...prev]
      );
      setNotice(editingId ? "Changes saved." : "Added.");
      reset();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: Item) => {
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
    setError("");
    setNotice("");
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleActive = async (item: Item) => {
    const res = await fetch(`/api/admin/catalogue/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i._id === item._id ? data.item : i)));
    } else {
      setError(data.error ?? "Could not update.");
    }
  };

  const remove = async (item: Item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/catalogue/${item._id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      if (editingId === item._id) reset();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not delete.");
    }
  };

  const shown = items.filter((i) => filter === "all" || i.type === filter);
  const sectorLabel = (slug: string) => SECTORS.find((s) => s.slug === slug)?.label ?? slug;

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      {/* ---------- Form ---------- */}
      <div ref={formTop} className="scroll-mt-6">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            {editingId ? "Edit item" : "Add new item"}
          </h2>

          {/* Type */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
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

          <div className="mt-4 space-y-4">
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
                    <label
                      key={s.slug}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${
                        on
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                      }`}
                    >
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
                <div className="space-y-2">
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

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          {notice && <p className="mt-4 text-sm font-medium text-green-700">{notice}</p>}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ---------- List ---------- */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            All items <span className="text-slate-400">({shown.length})</span>
          </h2>
          <div className="flex gap-2">
            {(["all", "product", "service"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${
                  filter === f
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {f === "all" ? "All" : `${f}s`}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Nothing here yet. Add your first item on the left.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {shown.map((item) => (
              <li key={item._id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-300">
                      {(item.brand || item.name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-950">{item.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-slate-600">
                      {item.type}
                    </span>
                    {!item.active && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-amber-700">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {item.sectorTags.map(sectorLabel).join(" · ")}
                    {item.category ? ` · ${item.category}` : ""}
                    {item.type === "product" && item.price
                      ? ` · KES ${item.price.toLocaleString()}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    className="text-slate-600 hover:text-blue-700"
                  >
                    {item.active ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => edit(item)}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}