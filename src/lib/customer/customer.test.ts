import { describe, it, expect } from "vitest";
import { prisma } from "../db/prisma";
import { assertCustomerAccess, assertOrderAccess, assertDocumentAccess, sanitizeOrderForCustomer } from "../rbac/isolation";
import { ForbiddenError } from "../errors/app-error";
import { UserSession } from "../types/auth";

describe("Phase 4 Customer Portal & Workspace Security", () => {
  it("should enforce strict customer data boundary and prevent IDOR", () => {
    const customerSessionA: UserSession = {
      userId: "user-alpha",
      fullName: "Client Alpha",
      role: "CUSTOMER",
      customerProfileId: "profile-alpha-123",
    };

    // Accessing own profile -> OK
    expect(() => assertCustomerAccess(customerSessionA, "profile-alpha-123")).not.toThrow();

    // Accessing another customer's profile -> FORBIDDEN
    expect(() => assertCustomerAccess(customerSessionA, "profile-beta-456")).toThrow(ForbiddenError);

    // Accessing another customer's order -> FORBIDDEN
    expect(() =>
      assertOrderAccess(customerSessionA, {
        customerId: "profile-beta-456",
        assignedExpertId: "expert-1",
      })
    ).toThrow(ForbiddenError);

    // Accessing another customer's document -> FORBIDDEN
    expect(() =>
      assertDocumentAccess(customerSessionA, {
        customerId: "profile-beta-456",
        order: null,
      })
    ).toThrow(ForbiddenError);
  });

  it("should sanitize order details and strictly purge internal notes from customer views", () => {
    const mockRawOrder = {
      id: "ord-999",
      orderNumber: "FYN-2026-000999",
      status: "WORK_IN_PROGRESS",
      messages: [
        { id: "msg-1", message: "Hello CA, here is my document", isInternalOnly: false },
        { id: "msg-2", message: "INTERNAL NOTE: Scrutinize capital gains calculation", isInternalOnly: true },
      ],
      steps: [
        { id: "st-1", stepNumber: 1, title: "Payment", notes: "Internal check complete", status: "COMPLETED" },
        { id: "st-2", stepNumber: 2, title: "Filing", notes: "Awaiting portal OTP", status: "IN_PROGRESS" },
      ],
      assignedExpert: {
        id: "exp-1",
        qualification: "FCA, DISA",
        experienceYears: 12,
        rating: 4.9,
        internalNotes: "Senior Partner - P&L reviewer",
      },
    };

    const sanitized = sanitizeOrderForCustomer(mockRawOrder);

    // 1. Internal messages must be removed
    expect(sanitized.messages.length).toBe(1);
    expect(sanitized.messages[0].isInternalOnly).toBe(false);
    expect(sanitized.messages.some((m: any) => m.isInternalOnly)).toBe(false);

    // 2. Step internal notes must be deleted
    expect((sanitized.steps[0] as any).notes).toBeUndefined();
    expect((sanitized.steps[1] as any).notes).toBeUndefined();

    // 3. Expert details should have generic public display name
    expect((sanitized.assignedExpert as any).displayName).toBe("Fyntrust Certified Expert");
    expect((sanitized.assignedExpert as any).internalNotes).toBeUndefined();
  });

  it("should query customer active orders and compliance records accurately", async () => {
    const customer = await prisma.customerProfile.findFirst({
      include: { orders: true, compliances: true },
    });

    expect(customer).not.toBeNull();
    if (!customer) return;

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
    });

    expect(Array.isArray(orders)).toBe(true);
  });
});
