import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "order:update-status");

    const body = await req.json();
    const { status, internalNote } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    // If an internal note was provided, save it with isInternalOnly = true
    if (internalNote) {
      await prisma.orderMessage.create({
        data: {
          orderId: order.id,
          senderId: session.userId,
          senderRole: session.role,
          message: internalNote,
          isInternalOnly: true, // Strictly internal
        },
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Order",
      entityId: order.id,
      oldValue: { status: order.status },
      newValue: { status: updated.status, addedInternalNote: Boolean(internalNote) },
    });

    return apiSuccess(updated, "Order updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
