import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { errorResponse, handleApiError } from "@/lib/apiResponse";
import { updateRequestSchema } from "@/lib/validations";
import {
  isValidObjectId,
  getRequestById,
  updateServiceRequest,
  cancelServiceRequest,
} from "@/lib/request-detail-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return errorResponse("Unauthorized. Please sign in.", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid request ID.", 400);
    }

    const doc = await getRequestById(id);
    if (!doc) {
      return errorResponse("Request not found.", 404);
    }

    return NextResponse.json({ request: doc });
  } catch (error) {
    return handleApiError(error, "GET /api/requests/[id]");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return errorResponse("Unauthorized. Please sign in.", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid request ID.", 400);
    }

    const body = await request.json();
    const updates = updateRequestSchema.parse(body);

    const result = await updateServiceRequest(
      id,
      updates,
      session.user.id,
      session.user.email ?? "unknown"
    );

    if (result.notFound) {
      return errorResponse("Request not found.", 404);
    }

    return NextResponse.json({
      message: "Request updated successfully.",
      changesApplied: result.changes.length,
    });
  } catch (error) {
    return handleApiError(error, "PATCH /api/requests/[id]");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return errorResponse("Unauthorized. Please sign in.", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid request ID.", 400);
    }

    const result = await cancelServiceRequest(
      id,
      session.user.id,
      session.user.email ?? "unknown"
    );

    if (result.notFound) {
      return errorResponse("Request not found.", 404);
    }

    return NextResponse.json({
      message: result.alreadyCancelled
        ? "Request was already cancelled."
        : "Request has been cancelled.",
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/requests/[id]");
  }
}
