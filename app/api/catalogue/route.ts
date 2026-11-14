import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CatalogItem from "@/models/CatalogItem";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const items = await CatalogItem.find({ active: true })
      .select("type name slug description brand category image price currency sectorTags order")
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json(JSON.parse(JSON.stringify(items)));
  } catch (error) {
    console.error("GET /api/catalogue failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}