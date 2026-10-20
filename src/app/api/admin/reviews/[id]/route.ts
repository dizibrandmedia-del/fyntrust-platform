import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const { status, isPublished, rating, reviewText } = body;

    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        isPublished: isPublished !== undefined ? isPublished : status === "APPROVED",
        rating: rating !== undefined ? Math.min(5, Math.max(1, Number(rating))) : undefined,
        reviewText: reviewText || undefined,
        publishedAt: (status === "APPROVED" || isPublished) ? new Date() : undefined,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "UPDATE",
      entity: "Customer",
      entityId: review.id,
      newValue: { status, isPublished },
    });

    return apiSuccess({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
