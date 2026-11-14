import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import CatalogItem from "@/models/CatalogItem";
import { cleanItem, deleteUploadedImage, isAdmin } from "@/lib/catalogue-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    await connectDB();

    const existing = await CatalogItem.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Quick show/hide toggle
    if (Object.keys(body).length === 1 && typeof body.active === "boolean") {
      const updated = await CatalogItem.findByIdAndUpdate(
        id,
        { $set: { active: body.active } },
        { new: true }
      ).lean();
      return NextResponse.json({ item: JSON.parse(JSON.stringify(updated)) });
    }

    const result = cleanItem(body);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { price, order, ...rest } = result.data;

    const set: Record<string, unknown> = { ...rest };
    if (order !== undefined) set.order = order;

    const update =
      price === undefined
        ? { $set: set, $unset: { price: 1 } }
        : { $set: { ...set, price } };

    const updated = await CatalogItem.findByIdAndUpdate(id, update, { new: true }).lean();

    // If the picture was replaced, remove the old uploaded one
    if (existing.image && existing.image !== result.data.image) {
      await deleteUploadedImage(existing.image);
    }

    return NextResponse.json({ item: JSON.parse(JSON.stringify(updated)) });
  } catch (error) {
    console.error("PATCH /api/admin/catalogue failed:", error);
    return NextResponse.json({ error: "Could not save. Try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const existing = await CatalogItem.findById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await deleteUploadedImage(existing.image);
    await CatalogItem.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/catalogue failed:", error);
    return NextResponse.json({ error: "Could not delete. Try again." }, { status: 500 });
  }
}