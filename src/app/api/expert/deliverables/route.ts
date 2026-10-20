import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can access deliverables");
      }
    }

    if (!expertProfileId) {
      return apiSuccess([]);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const orderId = searchParams.get("orderId") || "";

    const where: any = {
      order: {
        assignedExpertId: expertProfileId,
      },
    };

    if (status && status !== "ALL") where.status = status;
    if (orderId) where.orderId = orderId;

    const deliverables = await prisma.deliverable.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            service: { select: { name: true } },
            customer: { select: { businessName: true, user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(deliverables);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Only assigned experts can upload deliverables");
      }
    }

    const body = await req.json();
    const { orderId, name, deliverableType, fileUrl, fileSize, description } = body;

    if (!orderId || !name || !fileUrl) {
      throw new Error("orderId, deliverable name, and fileUrl are required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { include: { user: true } }, service: true },
    });

    if (!order) throw new Error("Order not found");

    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    const deliverable = await prisma.deliverable.create({
      data: {
        orderId,
        expertId: expertProfileId!,
        name,
        deliverableType: deliverableType || "CERTIFICATE",
        fileUrl,
        fileSize: fileSize ? parseInt(fileSize) : 0,
        description: description || null,
        status: "SUBMITTED_FOR_REVIEW",
      },
    });

    // Advance order step 5 (Filing Completion & Certificate Delivery) to UNDER_REVIEW
    await prisma.orderStep.updateMany({
      where: { orderId: order.id, stepNumber: 5 },
      data: { status: "IN_PROGRESS", notes: "Deliverable uploaded by CA expert, awaiting final approval" },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Document",
      entityId: deliverable.id,
      newValue: { orderId, name, deliverableType, status: "SUBMITTED_FOR_REVIEW" },
    });

    return apiSuccess(deliverable, "Deliverable submitted for review successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
