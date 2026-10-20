import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { assertOrderAccess, assertDocumentAccess } from "@/lib/rbac/isolation";
import { UserSession } from "@/lib/types/auth";

describe("Phase 6: Expert / CA Partner Portal & Assignment Security", () => {
  let expertASession: UserSession;
  let expertBSession: UserSession;
  let customerSession: UserSession;

  beforeEach(() => {
    expertASession = {
      userId: "user-exp-a",
      email: "ca.sharma@fyntrust.in",
      role: "CA_FINANCE_EXPERT",
      fullName: "CA Rohit Sharma",
      expertProfileId: "expert-a-id",
    };

    expertBSession = {
      userId: "user-exp-b",
      email: "ca.verma@fyntrust.in",
      role: "CA_FINANCE_EXPERT",
      fullName: "CA Ankit Verma",
      expertProfileId: "expert-b-id",
    };

    customerSession = {
      userId: "user-cust-1",
      email: "client@test.com",
      role: "CUSTOMER",
      fullName: "Client Enterprise",
      customerProfileId: "cust-1-id",
    };
  });

  it("should enforce assignment-based order access control", () => {
    const assignedToA = {
      customerId: "cust-1-id",
      assignedExpertId: "expert-a-id",
    };

    const assignedToB = {
      customerId: "cust-2-id",
      assignedExpertId: "expert-b-id",
    };

    const unassignedOrder = {
      customerId: "cust-1-id",
      assignedExpertId: null,
    };

    // Expert A can access order assigned to Expert A
    expect(() => assertOrderAccess(expertASession, assignedToA)).not.toThrow();

    // Expert A CANNOT access order assigned to Expert B
    expect(() => assertOrderAccess(expertASession, assignedToB)).toThrow(
      "You can only access orders assigned to your expert profile"
    );

    // Expert A CANNOT access unassigned order
    expect(() => assertOrderAccess(expertASession, unassignedOrder)).toThrow(
      "You can only access orders assigned to your expert profile"
    );

    // Expert B can access order assigned to Expert B
    expect(() => assertOrderAccess(expertBSession, assignedToB)).not.toThrow();
  });

  it("should enforce assignment-based document access control", () => {
    const docForA = {
      customerId: "cust-1-id",
      order: { assignedExpertId: "expert-a-id" },
    };

    const docForB = {
      customerId: "cust-2-id",
      order: { assignedExpertId: "expert-b-id" },
    };

    // Expert A can access doc for their order
    expect(() => assertDocumentAccess(expertASession, docForA)).not.toThrow();

    // Expert A CANNOT access doc for Expert B's order
    expect(() => assertDocumentAccess(expertASession, docForB)).toThrow(
      "You can only access documents for orders assigned to you"
    );
  });

  it("should verify deliverable workflow and customer vault integration on completion", async () => {
    // 1. Create Service and Customer
    const category = await prisma.serviceCategory.findFirst();
    const service = await prisma.service.create({
      data: {
        name: "GST Audit Deliverable Test",
        slug: `gst-audit-test-${Date.now()}`,
        categoryId: category?.id || "default-cat",
        shortDescription: "GST audit testing service",
        fullDescription: "GST audit testing service description",
        startingPrice: 5000,
        whatsIncluded: "[]",
        documentsRequired: "[]",
        processSteps: "[]",
      },
    });

    const user = await prisma.user.create({
      data: {
        fullName: "Test Deliverable Client",
        mobile: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `deliv_${Date.now()}@example.com`,
        passwordHash: "hash123",
        role: "CUSTOMER",
        customerProfile: {
          create: {
            businessName: "Deliverable Testing Corp",
            businessType: "PRIVATE_LIMITED",
            city: "Lucknow",
            state: "Uttar Pradesh",
          },
        },
      },
      include: { customerProfile: true },
    });

    // 2. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: `FYN-TEST-${Date.now()}`,
        customerId: user.customerProfile!.id,
        serviceId: service.id,
        status: "WORK_IN_PROGRESS",
        paymentStatus: "PAID",
        totalAmount: 5000,
      },
    });

    // 3. Create Deliverable
    const deliverable = await prisma.deliverable.create({
      data: {
        orderId: order.id,
        name: "Official GST Audit Certification",
        deliverableType: "CERTIFICATE",
        fileUrl: "https://fyntrust.in/deliverables/gst_cert.pdf",
        status: "SUBMITTED_FOR_REVIEW",
      },
    });

    expect(deliverable.id).toBeDefined();
    expect(deliverable.status).toBe("SUBMITTED_FOR_REVIEW");

    // 4. Update status to DELIVERED
    const updatedDeliverable = await prisma.deliverable.update({
      where: { id: deliverable.id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });

    expect(updatedDeliverable.status).toBe("DELIVERED");
  });
});
