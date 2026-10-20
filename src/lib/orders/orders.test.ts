import { describe, it, expect } from "vitest";
import { prisma } from "../db/prisma";
import { calculateOrderPricing, generateNextOrderNumber } from "./pricing";
import { getServiceRequirements } from "./requirements";
import { paymentGateway } from "../payments";
import { assertOrderAccess } from "../rbac/isolation";
import { ForbiddenError } from "../errors/app-error";
import { UserSession } from "../types/auth";

describe("Phase 3 Smart Order & Pricing Engine", () => {
  it("should retrieve dynamic requirements and document configuration by service", () => {
    const gstReq = getServiceRequirements("gst-registration");
    expect(gstReq.questions.length).toBeGreaterThanOrEqual(3);
    expect(gstReq.documents.length).toBeGreaterThanOrEqual(4);

    const panDoc = gstReq.documents.find((d) => d.name.includes("PAN"));
    expect(panDoc).toBeDefined();
    expect(panDoc?.required).toBe(true);

    const pvtLtdReq = getServiceRequirements("private-limited-company-registration");
    expect(pvtLtdReq.questions.find((q) => q.id === "proposedNames")).toBeDefined();
  });

  it("should calculate exact pricing with 18% statutory GST", async () => {
    const gstService = await prisma.service.findUnique({
      where: { slug: "gst-registration" },
      include: { packages: true },
    });

    expect(gstService).not.toBeNull();
    if (!gstService) return;

    const pricing = await calculateOrderPricing(gstService.id);
    expect(pricing.basePrice).toBe(499);
    expect(pricing.taxAmount).toBe(Math.round(499 * 0.18)); // 90
    expect(pricing.totalAmount).toBe(499 + Math.round(499 * 0.18)); // 589
    expect(pricing.currency).toBe("INR");

    if (gstService.packages.length > 0) {
      const pkg = gstService.packages[0];
      const pkgPricing = await calculateOrderPricing(gstService.id, pkg.id);
      expect(pkgPricing.basePrice).toBe(pkg.price);
      expect(pkgPricing.totalAmount).toBe(pkg.price + Math.round(pkg.price * 0.18));
    }
  });

  it("should generate sequential unique order numbers", async () => {
    const orderNumber1 = await generateNextOrderNumber();
    expect(orderNumber1).toMatch(/^FYN-\d{4}-\d{6}$/);
  });

  it("should enforce strict tenant order boundaries", () => {
    const customerA: UserSession = {
      userId: "user-a",
      fullName: "Customer A",
      role: "CUSTOMER",
      customerProfileId: "profile-a",
    };

    const orderB = {
      customerId: "profile-b",
      assignedExpertId: "expert-1",
    };

    expect(() => assertOrderAccess(customerA, orderB)).toThrow(ForbiddenError);
  });

  it("should initiate and cryptographically verify payments", async () => {
    const init = await paymentGateway.createPaymentOrder({
      orderId: "order-test-123",
      orderNumber: "FYN-2026-999999",
      amount: 589,
      customerName: "Test Client",
      customerEmail: "test@client.com",
    });

    expect(init.gatewayOrderId).toBeDefined();

    const verify = await paymentGateway.verifyPayment({
      gatewayOrderId: init.gatewayOrderId,
      gatewayPaymentId: "pay_test_456",
      gatewaySignature: "sig_valid_123",
    });

    expect(verify.isValid).toBe(true);
    expect(verify.status).toBe("COMPLETED");
  });
});
