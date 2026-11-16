import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import CatalogImage from "@/models/CatalogImage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return new NextResponse(`Route works, but "${id}" is not a valid id`, { status: 404 });
  }

  await connectDB();
  const doc = await CatalogImage.findById(id);
  if (!doc) {
    return new NextResponse("Route works, but no picture with this id is in the database", {
      status: 404,
    });
  }

  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}