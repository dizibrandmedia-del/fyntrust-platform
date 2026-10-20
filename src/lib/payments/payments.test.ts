import { describe, it, expect } from "vitest";
import { paymentGateway } from "./index";

describe("Payment Gateway Abstraction", () => {
  it("should create payment order through abstracted interface", async () => {
    const order = await paymentGateway.createPaymentOrder({
      orderId: "order-uuid-1",
      orderNumber: "FYN-2026-0001",
      amount: 999,
      customerName: "Aarav Singhania",
      customerEmail: "client@aaravtech.com",
    });

    expect(order.gatewayOrderId).toBeDefined();
    expect(order.amount).toBe(999);
    expect(order.currency).toBe("INR");
    expect(order.paymentLink).toContain("orderId=order-uuid-1");
  });

  it("should verify payment signature", async () => {
    const result = await paymentGateway.verifyPayment({
      gatewayOrderId: "mock_order_123",
      gatewayPaymentId: "mock_pay_456",
      gatewaySignature: "sig_abc",
    });

    expect(result.isValid).toBe(true);
    expect(result.status).toBe("COMPLETED");
  });

  it("should handle refund request through abstraction", async () => {
    const result = await paymentGateway.refundPayment("mock_pay_456", 999, "Customer cancellation");
    expect(result.success).toBe(true);
    expect(result.refundId).toBeDefined();
  });
});
