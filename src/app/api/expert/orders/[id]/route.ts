import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            state: true,
            address: true,
            gstNumber: true,
            panNumber: true,
            user: { select: { fullName: true, mobile: true, email: true } },
          },
        },
        service: true,
        package: true,
        steps: { orderBy: { stepNumber: "asc" } },
        documents: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        deliverables: { orderBy: { createdAt: "desc" } },
        messages: {
          include: { sender: { select: { fullName: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) throw new Error("Order not found");

    // Enforce Assignment Access Rule
    assertOrderAccess(session, {
      customerId: order.customer.id,
      assignedExpertId: order.assignedExpertId,
    });

    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!order) throw new Error("Order not found");

    // Enforce Assignment Access Rule
    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    const body = await req.json();
    const { status, stepNumber, stepStatus, stepNotes } = body;

    const permittedStatuses = [
      "WORK_IN_PROGRESS",
      "SUBMITTED_FILED",
      "GOVERNMENT_PROCESSING",
      "UNDER_REVIEW",
      "COMPLETED",
    ];

    if (status && !permittedStatuses.includes(status)) {
      throw new Error(`Invalid status transition for expert: ${status}`);
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || order.status,
        completedAt: status === "COMPLETED" ? new Date() : order.completedAt,
      },
    });

    // If a step update was provided
    if (stepNumber !== undefined && stepStatus) {
      await prisma.orderStep.updateMany({
        where: { orderId: order.id, stepNumber: parseInt(stepNumber) },
        data: {
          status: stepStatus,
          notes: stepNotes || null,
          completedAt: stepStatus === "COMPLETED" ? new Date() : null,
        },
      });
    }

    // Notify Customer about Filing Progress
    if (status) {
      await prisma.customerNotification.create({
        data: {
          userId: order.customer.userId,
          title: `Filing Progress: ${order.orderNumber}`,
          message: `Your assigned Chartered Accountant has updated the work status to "${status.replace(/_/g, " ")}".`,
          linkUrl: `/customer/orders/${order.id}`,
        },
      });
    }

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "STATUS_CHANGE",
      entity: "Order",
      entityId: order.id,
      oldValue: { status: order.status },
      newValue: { status: updated.status },
    });

    return apiSuccess(updated, "Work status updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
