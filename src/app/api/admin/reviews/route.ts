import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { businessName: true, user: { select: { fullName: true, mobile: true } } } },
      },
    });

    return apiSuccess({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();

    const {
      customerName,
      businessName,
      city,
      serviceName,
      rating = 5,
      reviewText,
      photoUrl,
      status = "APPROVED",
      isPublished = true,
    } = body;

    if (!customerName || !businessName || !city || !serviceName || !reviewText) {
      throw new Error("Customer name, business name, city, service, and review text are required");
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        businessName,
        city,
        serviceName,
        rating: Math.min(5, Math.max(1, Number(rating))),
        reviewText,
        photoUrl: photoUrl || null,
        status,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Customer",
      entityId: review.id,
      newValue: { customerName, rating, status },
    });

    return apiSuccess({ review }, "Review created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
