import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";

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
        throw new ForbiddenError("Only assigned experts can access messages");
      }
    }

    if (!expertProfileId) return apiSuccess([]);

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const where: any = {
      order: {
        assignedExpertId: expertProfileId,
      },
    };

    if (orderId) {
      where.orderId = orderId;
    }

    const messages = await prisma.orderMessage.findMany({
      where,
      include: {
        sender: { select: { fullName: true, role: true } },
        order: { select: { id: true, orderNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return apiSuccess(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const body = await req.json();
    const { orderId, message, isInternalOnly } = body;

    if (!orderId || !message) {
      throw new Error("orderId and message are required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) throw new Error("Order not found");

    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    const msg = await prisma.orderMessage.create({
      data: {
        orderId,
        senderId: session.userId,
        senderRole: session.role,
        message,
        isInternalOnly: Boolean(isInternalOnly),
      },
      include: {
        sender: { select: { fullName: true, role: true } },
      },
    });

    // If public client message, notify customer
    if (!isInternalOnly && order.customer?.userId) {
      await prisma.customerNotification.create({
        data: {
          userId: order.customer.userId,
          title: `New Message from CA on Order ${order.orderNumber}`,
          message: message.slice(0, 100),
          linkUrl: `/customer/orders/${order.id}`,
        },
      });
    }

    return apiSuccess(msg, "Message sent successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
