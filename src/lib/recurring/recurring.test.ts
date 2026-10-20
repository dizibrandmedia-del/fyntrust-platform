import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  createRecurringService,
  generateCycleInvoice,
  processCyclePayment,
  updateRecurringServiceStatus,
} from "./recurring-engine";

describe("Phase 7: Recurring Services & Billing Engine", () => {
  it("should create a recurring service subscription and initialize Cycle 1", async () => {
    const category = await prisma.serviceCategory.findFirst();
    const service = await prisma.service.create({
      data: {
        name: "Monthly GST Filing Retainer",
        slug: `monthly-gst-test-${Date.now()}`,
        categoryId: category?.id || "default-cat",
        shortDescription: "Monthly GST filing service",
        fullDescription: "Monthly GST filing service description",
        startingPrice: 2499,
        whatsIncluded: "[]",
        documentsRequired: "[]",
        processSteps: "[]",
      },
    });

    const user = await prisma.user.create({
      data: {
        fullName: "Recurring Test Client",
        mobile: `96${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `recur_${Date.now()}@example.com`,
        passwordHash: "hash123",
        role: "CUSTOMER",
        customerProfile: {
          create: {
            businessName: "Recurring Corp",
            businessType: "PVT_LTD",
            city: "Lucknow",
            state: "Uttar Pradesh",
          },
        },
      },
      include: { customerProfile: true },
    });

    const { recurring, initialCycle } = await createRecurringService({
      customerId: user.customerProfile!.id,
      serviceId: service.id,
      billingFrequency: "MONTHLY",
      amount: 2499,
      discount: 0,
    });

    expect(recurring.id).toBeDefined();
    expect(recurring.status).toBe("ACTIVE");
    expect(recurring.totalAmount).toBe(Number((2499 * 1.18).toFixed(2)));
    expect(initialCycle.cycleNumber).toBe(1);
    expect(initialCycle.status).toBe("PAID");
  });

  it("should generate cycle invoice and strictly prevent duplicate invoices", async () => {
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true },
    });
    const service = await prisma.service.findFirst();

    const { recurring } = await createRecurringService({
      customerId: customer!.id,
      serviceId: service!.id,
      billingFrequency: "MONTHLY",
      amount: 4999,
    });

    // Create Cycle 2 in PENDING state
    const cycle2 = await prisma.recurringBillingCycle.create({
      data: {
        recurringServiceId: recurring.id,
        cycleNumber: 2,
        periodLabel: "May 2026",
        startDate: new Date(2026, 4, 1),
        endDate: new Date(2026, 4, 31),
        dueDate: new Date(2026, 4, 5),
        amount: recurring.totalAmount,
        status: "PENDING",
      },
    });

    // Generate first invoice
    const inv1 = await generateCycleInvoice(recurring.id, 2);
    expect(inv1.id).toBeDefined();
    expect(inv1.invoiceNumber).toContain("FYN/INV/");

    // Attempt to generate second invoice for same cycle -> should return existing invoice (NO duplicate)
    const inv2 = await generateCycleInvoice(recurring.id, 2);
    expect(inv2.id).toBe(inv1.id);
    expect(inv2.invoiceNumber).toBe(inv1.invoiceNumber);

    // Verify billing cycle updated
    const updatedCycle = await prisma.recurringBillingCycle.findUnique({
      where: { id: cycle2.id },
    });
    expect(updatedCycle?.invoiceId).toBe(inv1.id);
    expect(updatedCycle?.status).toBe("INVOICED");
  });

  it("should handle status changes (pause, resume, cancel)", async () => {
    const customer = await prisma.customerProfile.findFirst();
    const service = await prisma.service.findFirst();

    const { recurring } = await createRecurringService({
      customerId: customer!.id,
      serviceId: service!.id,
      billingFrequency: "MONTHLY",
      amount: 1999,
    });

    // Pause
    const paused = await updateRecurringServiceStatus(recurring.id, "PAUSED");
    expect(paused.status).toBe("PAUSED");

    // Resume
    const resumed = await updateRecurringServiceStatus(recurring.id, "ACTIVE");
    expect(resumed.status).toBe("ACTIVE");

    // Cancel
    const cancelled = await updateRecurringServiceStatus(recurring.id, "CANCELLED");
    expect(cancelled.status).toBe("CANCELLED");
  });
});
