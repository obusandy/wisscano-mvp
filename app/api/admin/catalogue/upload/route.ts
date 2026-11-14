import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CatalogImage from "@/models/CatalogImage";
import { isAdmin, IMAGE_PREFIX } from "@/lib/catalogue-admin";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG or WebP picture." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Picture is too large." }, { status: 400 });
    }

    await connectDB();
    const doc = await CatalogImage.create({
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });

    return NextResponse.json({ url: `${IMAGE_PREFIX}${doc._id}` }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/catalogue/upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}