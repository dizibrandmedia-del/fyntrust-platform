import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { paymentGateway } from "@/lib/payments";
import { calculateOrderPricing } from "@/lib/orders/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      throw new Error("orderId is required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: true } },
        service: true,
        package: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.customer.userId !== session.userId && session.role === "CUSTOMER") {
      throw new Error("Unauthorized access to this order");
    }

    // Recompute price strictly on server
    const pricing = await calculateOrderPricing(order.serviceId, order.packageId);

    // Create payment order through gateway abstraction
    const gatewayOrder = await paymentGateway.createPaymentOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: pricing.totalAmount,
      currency: "INR",
      customerName: order.customer.user.fullName,
      customerEmail: order.customer.user.email,
      customerMobile: order.customer.user.mobile,
    });

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        customerId: order.customerId,
        paymentGateway: process.env.PAYMENT_GATEWAY_PROVIDER || "MOCK",
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        amount: pricing.totalAmount,
        currency: "INR",
        status: "PENDING",
      },
    });

    return apiSuccess({
      paymentId: payment.id,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      amount: pricing.totalAmount,
      currency: "INR",
      paymentLink: gatewayOrder.paymentLink,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
