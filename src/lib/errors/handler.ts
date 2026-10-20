import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./app-error";
import { ApiResponse } from "../types/api";

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    const message =
      formattedErrors.length > 0
        ? formattedErrors.map((e) => e.message).join(", ")
        : "The provided request data is invalid";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message,
          details: formattedErrors,
        },
      },
      { status: 400 }
    );
  }

  // Log unknown internal error safely
  console.error("[FYNTRUST_INTERNAL_ERROR]", error);

  // Return generic error to never expose sensitive DB/Server details
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please contact Fyntrust support if the issue persists.",
      },
    },
    { status: 500 }
  );
}

export function apiSuccess<T>(data: T, message?: string, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}
