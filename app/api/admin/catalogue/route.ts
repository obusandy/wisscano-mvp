import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CatalogItem from "@/models/CatalogItem";
import { cleanItem, isAdmin, slugify, uniqueSlug } from "@/lib/catalogue-admin";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const result = cleanItem(body);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const d = result.data;

    await connectDB();
    const slug = await uniqueSlug(slugify(d.name));

    // New services go to the end of the list unless an order is given
    let order = d.order;
    if (order === undefined) {
      if (d.type === "service") {
        const last = (await CatalogItem.findOne({ type: "service" })
          .sort({ order: -1 })
          .lean()) as { order?: number } | null;
        order = (last?.order ?? 0) + 1;
      } else {
        order = 0;
      }
    }

    const created = await CatalogItem.create({ ...d, slug, order, currency: "KES" });
    return NextResponse.json(
      { item: JSON.parse(JSON.stringify(created)) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/catalogue failed:", error);
    return NextResponse.json({ error: "Could not save. Try again." }, { status: 500 });
  }
}