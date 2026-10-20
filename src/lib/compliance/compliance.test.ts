import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  seedDefaultComplianceRules,
  generateCustomerComplianceCalendar,
  checkOverdueCompliances,
} from "./compliance-engine";
import { assertCustomerAccess } from "@/lib/rbac/isolation";
import { UserSession } from "@/lib/types/auth";

describe("Phase 7: Statutory Compliance Management Engine", () => {
  it("should seed default statutory rules and generate customer calendar", async () => {
    await seedDefaultComplianceRules();

    const rules = await prisma.complianceRule.findMany({ where: { isActive: true } });
    expect(rules.length).toBeGreaterThanOrEqual(5);

    const user = await prisma.user.create({
      data: {
        fullName: "Compliance Test Client",
        mobile: `95${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `comp_${Date.now()}@example.com`,
        passwordHash: "hash123",
        role: "CUSTOMER",
        customerProfile: {
          create: {
            businessName: "Compliance Pvt Ltd",
            businessType: "PVT_LTD",
            city: "Lucknow",
            state: "Uttar Pradesh",
          },
        },
      },
      include: { customerProfile: true },
    });

    const generated = await generateCustomerComplianceCalendar(user.customerProfile!.id, 2026);
    expect(generated.length).toBeGreaterThan(0);

    const firstRec = generated[0];
    expect(firstRec.customerId).toBe(user.customerProfile!.id);
    expect(firstRec.status).toBe("UPCOMING");
    expect(firstRec.dueDate).toBeDefined();
  });

  it("should scan and flag overdue compliance obligations with customer alert", async () => {
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true },
    });

    // Create past due item
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 5);

    const record = await prisma.complianceRecord.create({
      data: {
        customerId: customer!.id,
        title: "Past Due GSTR-3B Filing Test",
        category: "GST",
        period: "March 2026",
        dueDate: pastDue,
        status: "UPCOMING",
        penaltyRisk: "₹50/day late fee",
      },
    });

    const overdueCount = await checkOverdueCompliances();
    expect(overdueCount).toBeGreaterThanOrEqual(1);

    const updated = await prisma.complianceRecord.findUnique({
      where: { id: record.id },
    });
    expect(updated?.status).toBe("OVERDUE");
  });

  it("should enforce strict customer data isolation for compliance access", () => {
    const customerSessionA: UserSession = {
      userId: "user-a",
      email: "cust.a@test.com",
      role: "CUSTOMER",
      fullName: "Customer A",
      customerProfileId: "cust-profile-a",
    };

    // Access own compliance -> OK
    expect(() => assertCustomerAccess(customerSessionA, "cust-profile-a")).not.toThrow();

    // Access Customer B's compliance -> Throws ForbiddenError
    expect(() => assertCustomerAccess(customerSessionA, "cust-profile-b")).toThrow(
      "You are not authorized to access another customer's data"
    );
  });
});
