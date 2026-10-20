import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const body = await req.json();
    const { orderId, name, category, reason } = body;

    if (!orderId || !name || !reason) {
      throw new Error("orderId, document name, and reason are required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { include: { user: true } }, service: true },
    });

    if (!order) throw new Error("Order not found");

    // Enforce Assignment Access
    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    // Create requested pending document record
    const document = await prisma.document.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        name,
        fileKey: `requested/${order.orderNumber}/${name}`,
        fileUrl: "",
        fileType: "PDF",
        category: category || "GENERAL",
        status: "PENDING_UPLOAD",
        rejectionReason: reason,
        requestedByUserId: session.userId,
      },
    });

    // Advance order to DOCUMENTS_PENDING if needed
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DOCUMENTS_PENDING" },
    });

    // Create In-App Notification for customer
    await prisma.customerNotification.create({
      data: {
        userId: order.customer.userId,
        title: `Document Requested: ${name}`,
        message: `Your assigned CA requested "${name}" for filing ${order.service.name}: "${reason}". Please upload it in your document vault.`,
        linkUrl: `/customer/documents`,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Document",
      entityId: document.id,
      newValue: { orderId, name, reason },
    });

    return apiSuccess(document, "Document requested from client successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
