import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { errorResponse, handleApiError } from "@/lib/apiResponse";
import { isValidObjectId, getAuditHistory } from "@/lib/request-detail-service";

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

    const history = await getAuditHistory(id);
    return NextResponse.json({ history });
  } catch (error) {
    return handleApiError(error, "GET /api/requests/[id]/audit");
  }
}
