import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { assertOrderAccess } from "@/lib/rbac/isolation";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");
      assertOrderAccess(session, { customerId: order.customerId });

      const messages = await prisma.orderMessage.findMany({
        where: {
          orderId,
          isInternalOnly: false, // CRITICAL: strictly customer-visible only
        },
        include: { sender: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: "asc" },
      });

      return apiSuccess(messages);
    }

    // List all messages across customer orders
    const messages = await prisma.orderMessage.findMany({
      where: {
        order: { customerId: user.customerProfile.id },
        isInternalOnly: false,
      },
      include: {
        order: { select: { id: true, orderNumber: true, service: { select: { name: true } } } },
        sender: { select: { fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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
    const { orderId, message, attachments } = body;

    if (!orderId || !message || message.trim().length === 0) {
      throw new Error("orderId and message text are required");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    assertOrderAccess(session, { customerId: order.customerId });

    const created = await prisma.orderMessage.create({
      data: {
        orderId,
        senderId: session.userId,
        senderRole: session.role,
        message: message.trim(),
        attachments: attachments ? JSON.stringify(attachments) : null,
        isInternalOnly: false, // Customer messages are never internal
      },
      include: { sender: { select: { fullName: true, role: true } } },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Order",
      entityId: created.id,
      newValue: { orderId },
    });

    return apiSuccess(created, "Message sent successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
