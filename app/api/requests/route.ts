import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ServiceRequest from "@/models/ServiceRequest";
import Category from "@/models/Category";
import { createRequestSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { handleApiError, errorResponse } from "@/lib/apiResponse";
import { getAdminSession } from "@/lib/session";
import { listServiceRequests } from "@/lib/requests-service";

/**
 * POST /api/requests
 * Public endpoint — customers submit a new service request.
 * No authentication required, but rate-limited to prevent abuse.
 */
export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting: 5 submissions per 10 minutes per IP ---
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`create-request:${ip}`, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!allowed) {
      return errorResponse(
        "Too many requests submitted. Please try again later.",
        429
      );
    }

    const body = await request.json();

    // --- Validation: throws ZodError on failure, caught below ---
    const data = createRequestSchema.parse(body);

    await connectDB();

    // --- Verify the category actually exists and is active ---
    const category = await Category.findOne({
      _id: data.categoryId,
      isActive: true,
    });

    if (!category) {
      return errorResponse(
        "The selected service category is invalid or no longer available.",
        400
      );
    }

    const newRequest = await ServiceRequest.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      category: category._id,
      categoryNameSnapshot: category.name,
      description: data.description,
      preferredContact: data.preferredContact,
      status: "NEW",
    });

    return NextResponse.json(
      {
        message: "Your request has been submitted successfully.",
        requestId: newRequest._id,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "POST /api/requests");
  }
}
/**
 * GET /api/requests
 * Admin only — list/search/filter service requests with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session?.user) {
      return errorResponse("Unauthorized. Please sign in.", 401);
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());

    const result = await listServiceRequests(rawQuery);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "GET /api/requests");
  }
}
