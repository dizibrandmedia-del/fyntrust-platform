import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { notifications } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "order:assign-expert");

    const body = await req.json();
    const { expertProfileId } = body;

    if (!expertProfileId) {
      throw new Error("expertProfileId is required for assignment");
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: { include: { user: true } },
        service: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertProfileId },
      include: { user: true },
    });

    if (!expert || !expert.user.isActive) {
      throw new Error("Expert profile not found or user is deactivated");
    }

    if (expert.availabilityStatus === "SUSPENDED" || expert.availabilityStatus === "OFFLINE") {
      throw new Error(`Cannot assign expert with availability status: ${expert.availabilityStatus}`);
    }

    // Assign expert to order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        assignedExpertId: expert.id,
        assignedAt: new Date(),
        status: "EXPERT_ASSIGNED",
      },
      include: {
        assignedExpert: { select: { qualification: true, city: true } },
      },
    });

    // Advance milestone Step 3 (CA Assignment & Application Drafting)
    await prisma.orderStep.updateMany({
      where: { orderId: order.id, stepNumber: 3 },
      data: {
        status: "IN_PROGRESS",
      },
    });

    // Notify Customer about Expert Assignment
    await prisma.customerNotification.create({
      data: {
        userId: order.customer.userId,
        title: `CA Expert Assigned: ${order.service.name}`,
        message: `A dedicated Chartered Accountant (${expert.qualification}) has been assigned to your filing (Order: ${order.orderNumber}).`,
        linkUrl: `/customer/orders/${order.id}`,
      },
    });

    await notifications.send({
      eventType: "EXPERT_ASSIGNED",
      channel: "EMAIL",
      recipient: {
        name: order.customer.user.fullName,
        email: order.customer.user.email,
        mobile: order.customer.user.mobile,
      },
      variables: {
        customerName: order.customer.user.fullName,
        orderNumber: order.orderNumber,
        serviceName: order.service.name,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "ASSIGN",
      entity: "Order",
      entityId: order.id,
      newValue: {
        assignedExpertId: expert.id,
        expertName: expert.user.fullName,
        status: "EXPERT_ASSIGNED",
      },
    });

    return apiSuccess(updatedOrder, "Expert assigned successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
