import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (error) {
    console.error("DB health check failed:", error);
    return NextResponse.json(
      { status: "error", db: "disconnected" },
      { status: 500 }
    );
  }
}