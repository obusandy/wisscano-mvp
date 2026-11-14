import mongoose from "mongoose";
import { SECTORS } from "@/lib/catalogue";
import CatalogItem from "@/models/CatalogItem";
import CatalogImage from "@/models/CatalogImage";
import { requireAdminSession } from "@/lib/session";

export const IMAGE_PREFIX = "/api/catalogue/image/";

// True only when an admin is logged in
export async function isAdmin() {
  try {
    await requireAdminSession();
    return true;
  } catch {
    return false;
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

export async function uniqueSlug(base: string) {
  let slug = base;
  let n = 1;
  while (await CatalogItem.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type CleanItem = {
  type: "product" | "service";
  name: string;
  description: string;
  brand: string;
  category: string;
  image: string;
  price?: number;
  sectorTags: string[];
  order?: number;
  active: boolean;
};

export function cleanItem(
  body: Record<string, unknown>
): { error: string } | { data: CleanItem } {
  const type =
    body.type === "service" ? "service" : body.type === "product" ? "product" : null;
  if (!type) return { error: "Choose product or service." };

  const name = String(body.name ?? "").trim();
  if (!name) return { error: "Please enter a name." };

  const allowed: string[] = SECTORS.map((s) => s.slug);
  const sectorTags = Array.isArray(body.sectorTags)
    ? body.sectorTags.map(String).filter((s) => allowed.includes(s))
    : [];
  if (sectorTags.length === 0) return { error: "Pick at least one sector." };

  let price: number | undefined;
  if (type === "product") {
    price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: "Enter a price greater than 0 for a product." };
    }
  }

  const image = String(body.image ?? "").trim();
  if (image && !image.startsWith("/") && !image.startsWith("https://")) {
    return { error: "The image link is not valid." };
  }

  let order: number | undefined;
  if (body.order !== undefined && body.order !== "" && body.order !== null) {
    const o = Number(body.order);
    if (Number.isFinite(o)) order = Math.max(0, Math.round(o));
  }

  return {
    data: {
      type,
      name,
      description: String(body.description ?? "").trim(),
      brand: type === "product" ? String(body.brand ?? "").trim() : "",
      category: String(body.category ?? "").trim(),
      image,
      price,
      sectorTags,
      order,
      active: body.active !== false,
    },
  };
}

// Removes an uploaded picture from the database (ignores outside links)
export async function deleteUploadedImage(url?: string | null) {
  if (!url || !url.startsWith(IMAGE_PREFIX)) return;
  const id = url.slice(IMAGE_PREFIX.length);
  if (mongoose.isValidObjectId(id)) await CatalogImage.deleteOne({ _id: id });
}