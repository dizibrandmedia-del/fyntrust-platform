import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const { orderId, serviceName, rating = 5, reviewText } = body;

    if (!serviceName || !reviewText) {
      throw new Error("Service name and review text are required");
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      include: { user: true },
    });

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    const review = await prisma.review.create({
      data: {
        customerId: customer.id,
        orderId: orderId || null,
        customerName: customer.user.fullName,
        businessName: customer.businessName,
        city: customer.city || "PAN India",
        serviceName,
        rating: Math.min(5, Math.max(1, Number(rating))),
        reviewText,
        status: "PENDING", // Strictly pending until admin moderation
        isPublished: false,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: "CREATE",
      entity: "Customer",
      entityId: review.id,
      newValue: { customerName: customer.user.fullName, rating, status: "PENDING" },
    });

    return apiSuccess(
      { review },
      "Thank you! Your feedback has been submitted for verification.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
