import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

/**
 * Public endpoint — returns only active categories, sorted for display.
 * No auth required; this powers the customer-facing request form dropdown.
 */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .select("name slug description")
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json(
      { error: "Unable to load categories. Please try again shortly." },
      { status: 500 }
    );
  }
}
