import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { createOrderInvoice } from "@/lib/invoices";
import { notifications } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, payload, signature } = body;

    // 1. Basic Webhook payload validation
    if (!payload || !payload.orderId || !payload.gatewayPaymentId) {
      throw new Error("Invalid webhook payload structure");
    }

    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: {
        customer: { include: { user: true } },
        service: true,
        package: true,
      },
    });

    if (!order) {
      throw new Error("Order referenced in webhook does not exist");
    }

    // 2. Idempotency Check: if order is already marked as PAID, acknowledge without re-processing
    if (order.paymentStatus === "PAID") {
      return apiSuccess({ idempotent: true, message: "Order is already paid and processed" });
    }

    // 3. Process Successful Payment Event
    if (event === "payment.captured" || event === "order.paid" || event === "PAYMENT_SUCCESS") {
      // Update Payment Record
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: "COMPLETED",
          gatewayPaymentId: payload.gatewayPaymentId,
          paymentDate: new Date(),
        },
      });

      // Update Order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAYMENT_RECEIVED",
        },
      });

      // Generate Invoice
      const basePrice = order.package?.price || order.service.startingPrice;
      const taxAmount = Math.round(basePrice * 0.18);
      const invoice = await createOrderInvoice({
        orderId: order.id,
        customerId: order.customerId,
        amount: basePrice,
        taxAmount,
        totalAmount: order.totalAmount,
        serviceName: order.service.name,
        packageName: order.package?.name,
      });

      // Dispatch Notifications
      await notifications.send({
        eventType: "PAYMENT_SUCCESS",
        channel: "EMAIL",
        recipient: {
          name: order.customer.user.fullName,
          email: order.customer.user.email,
        },
        variables: {
          customerName: order.customer.user.fullName,
          orderNumber: order.orderNumber,
          serviceName: order.service.name,
          amount: order.totalAmount,
          invoiceNumber: invoice.invoiceNumber,
        },
      });

      await recordAuditLog({
        action: "UPDATE",
        entity: "Order",
        entityId: order.id,
        newValue: { gatewayPaymentId: payload.gatewayPaymentId, invoiceNumber: invoice.invoiceNumber },
      });

      return apiSuccess({ processed: true, orderNumber: order.orderNumber });
    }

    return apiSuccess({ received: true, event });
  } catch (error) {
    return handleApiError(error);
  }
}
