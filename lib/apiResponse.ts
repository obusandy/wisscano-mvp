import { NextResponse } from "next/server";
import { ZodError } from "zod";


export function errorResponse(
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleApiError(error: unknown, context: string) {
  console.error(`[${context}]`, error);

  if (error instanceof ZodError) {
    return errorResponse(
      "Validation failed. Please check your input.",
      400,
      error.flatten().fieldErrors
    );
  }

  // Mongoose duplicate key error
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    return errorResponse("A conflicting record already exists.", 409);
  }

  // Mongoose validation error
  if (error instanceof Error && error.name === "ValidationError") {
    return errorResponse("Validation failed. Please check your input.", 400);
  }

  return errorResponse(
    "Something went wrong on our end. Please try again shortly.",
    500
  );
}