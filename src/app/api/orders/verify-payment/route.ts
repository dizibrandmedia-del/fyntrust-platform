import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { paymentGateway } from "@/lib/payments";
import { createOrderInvoice } from "@/lib/invoices";
import { notifications } from "@/lib/notifications";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const { orderId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = body;

    if (!orderId || !gatewayOrderId || !gatewayPaymentId) {
      throw new Error("Missing required payment verification parameters");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: true } },
        service: true,
        package: true,
        documents: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.customer.userId !== session.userId && session.role === "CUSTOMER") {
      throw new Error("Unauthorized access to this order");
    }

    // 1. Verify Payment Cryptographically with Gateway
    const verification = await paymentGateway.verifyPayment({
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature: gatewaySignature || "",
    });

    if (!verification.isValid) {
      // Record failed payment attempt
      await prisma.payment.updateMany({
        where: { orderId: order.id, gatewayOrderId },
        data: {
          status: "FAILED",
          failureReason: "Cryptographic signature verification failed",
        },
      });

      throw new Error("Payment verification failed. Signature mismatch.");
    }

    // 2. Update Payment Record to COMPLETED
    await prisma.payment.updateMany({
      where: { orderId: order.id, gatewayOrderId },
      data: {
        status: "COMPLETED",
        gatewayPaymentId,
        gatewaySignature: gatewaySignature || null,
        paymentDate: new Date(),
      },
    });

    // 3. Determine next order status based on document completion
    const hasDocuments = order.documents.length > 0;
    const nextStatus = hasDocuments ? "READY_FOR_ASSIGNMENT" : "PAYMENT_RECEIVED";

    // 4. Update Order Status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: nextStatus,
      },
      include: { service: true, package: true },
    });

    // 5. Mark Step 1 (Payment) as COMPLETED
    await prisma.orderStep.updateMany({
      where: { orderId: order.id, stepNumber: 1 },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // 6. Generate Invoice (Idempotent)
    const basePrice = updatedOrder.package?.price || updatedOrder.service.startingPrice;
    const taxAmount = Math.round(basePrice * 0.18);
    const invoice = await createOrderInvoice({
      orderId: updatedOrder.id,
      customerId: updatedOrder.customerId,
      amount: basePrice,
      taxAmount,
      totalAmount: updatedOrder.totalAmount,
      serviceName: updatedOrder.service.name,
      packageName: updatedOrder.package?.name,
    });

    // 7. Dispatch Confirmation Notification
    await notifications.send({
      eventType: "PAYMENT_SUCCESS",
      channel: "EMAIL",
      recipient: {
        name: order.customer.user.fullName,
        email: order.customer.user.email,
        mobile: order.customer.user.mobile,
      },
      variables: {
        customerName: order.customer.user.fullName,
        orderNumber: updatedOrder.orderNumber,
        serviceName: updatedOrder.service.name,
        amount: updatedOrder.totalAmount,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    // 8. Record Audit Log
    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "UPDATE",
      entity: "Order",
      entityId: updatedOrder.id,
      newValue: {
        paymentStatus: "PAID",
        status: updatedOrder.status,
        gatewayPaymentId,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    return apiSuccess({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      orderId: updatedOrder.id,
      invoiceNumber: invoice.invoiceNumber,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
