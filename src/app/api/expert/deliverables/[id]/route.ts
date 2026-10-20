import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const deliverable = await prisma.deliverable.findUnique({
      where: { id: params.id },
      include: {
        order: { include: { customer: { include: { user: true } }, service: true } },
      },
    });

    if (!deliverable) throw new Error("Deliverable not found");

    assertOrderAccess(session, {
      customerId: deliverable.order.customerId,
      assignedExpertId: deliverable.order.assignedExpertId,
    });

    const body = await req.json();
    const { status, revisionFeedback } = body;

    const updated = await prisma.deliverable.update({
      where: { id: params.id },
      data: {
        status: status || deliverable.status,
        revisionFeedback: revisionFeedback !== undefined ? revisionFeedback : deliverable.revisionFeedback,
        deliveredAt: status === "DELIVERED" ? new Date() : deliverable.deliveredAt,
      },
    });

    // If marked DELIVERED, automatically register in customer Document Vault & complete Order
    if (status === "DELIVERED") {
      await prisma.document.create({
        data: {
          customerId: deliverable.order.customerId,
          orderId: deliverable.order.id,
          name: deliverable.name,
          fileKey: `deliverables/${deliverable.order.orderNumber}/${deliverable.name}`,
          fileUrl: deliverable.fileUrl,
          fileType: "PDF",
          category: "GENERAL",
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      // Complete Order & Step 5
      await prisma.order.update({
        where: { id: deliverable.order.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      await prisma.orderStep.updateMany({
        where: { orderId: deliverable.order.id, stepNumber: 5 },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      // Notify customer
      await prisma.customerNotification.create({
        data: {
          userId: deliverable.order.customer.userId,
          title: `Filing Completed: ${deliverable.name}`,
          message: `Your final filing deliverable "${deliverable.name}" for ${deliverable.order.service.name} is ready for download in your vault.`,
          linkUrl: `/customer/documents`,
        },
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Document",
      entityId: deliverable.id,
      newValue: { status, revisionFeedback },
    });

    return apiSuccess(updated, "Deliverable updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
