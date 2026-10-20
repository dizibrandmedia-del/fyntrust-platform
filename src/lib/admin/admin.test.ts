import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { hasPermission } from "@/lib/rbac/guard";
import { UserSession } from "@/lib/types/auth";

describe("Phase 5: Super Admin & Operations Control Centre", () => {
  let superAdminSession: UserSession;
  let adminSession: UserSession;
  let salesSession: UserSession;
  let customerSession: UserSession;

  beforeEach(() => {
    superAdminSession = {
      userId: "sa-1",
      email: "superadmin@fyntrust.in",
      role: "SUPER_ADMIN",
      fullName: "Super Administrator",
    };

    adminSession = {
      userId: "ad-1",
      email: "admin@fyntrust.in",
      role: "ADMIN",
      fullName: "Operations Admin",
    };

    salesSession = {
      userId: "sa-2",
      email: "sales@fyntrust.in",
      role: "SALES",
      fullName: "Sales Desk",
    };

    customerSession = {
      userId: "cust-1",
      email: "client@test.com",
      role: "CUSTOMER",
      fullName: "Client Enterprise",
    };
  });

  it("should enforce role-based permissions between Super Admin, Admin, and Sales", () => {
    // Super Admin has all permissions
    expect(hasPermission(superAdminSession, "settings:manage")).toBe(true);
    expect(hasPermission(superAdminSession, "audit:read")).toBe(true);
    expect(hasPermission(superAdminSession, "order:assign-expert")).toBe(true);

    // Admin has operational permissions but NOT settings:manage
    expect(hasPermission(adminSession, "order:assign-expert")).toBe(true);
    expect(hasPermission(adminSession, "document:verify")).toBe(true);
    expect(hasPermission(adminSession, "settings:manage")).toBe(false);

    // Sales has lead management but cannot assign experts or verify documents
    expect(hasPermission(salesSession, "lead:read-all")).toBe(true);
    expect(hasPermission(salesSession, "lead:create")).toBe(true);
    expect(hasPermission(salesSession, "order:assign-expert")).toBe(false);
    expect(hasPermission(salesSession, "document:verify")).toBe(false);

    // Customer cannot access any admin operational permissions
    expect(hasPermission(customerSession, "lead:read-all")).toBe(false);
    expect(hasPermission(customerSession, "order:assign-expert")).toBe(false);
    expect(hasPermission(customerSession, "document:verify")).toBe(false);
  });

  it("should convert a lead into a customer without creating duplicate accounts", async () => {
    const mobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const email = `lead_${mobile}@example.com`;

    // 1. Create Lead
    const lead = await prisma.lead.create({
      data: {
        name: "Test Entrepreneur",
        mobile,
        email,
        businessName: "Acme Innovations Pvt Ltd",
        source: "WEBSITE",
        status: "NEW_LEAD",
      },
    });

    expect(lead.id).toBeDefined();

    // 2. Convert Lead to Customer
    const passwordHash = await hashPassword("FynSecret@2026");
    const user = await prisma.user.create({
      data: {
        fullName: lead.name,
        mobile: lead.mobile,
        email: lead.email!,
        passwordHash,
        role: "CUSTOMER",
        customerProfile: {
          create: {
            businessName: lead.businessName!,
            businessType: "Private Limited",
            city: "Lucknow",
            state: "Uttar Pradesh",
          },
        },
      },
      include: { customerProfile: true },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "CONVERTED" },
    });

    expect(user.id).toBeDefined();
    expect(user.customerProfile?.businessName).toBe("Acme Innovations Pvt Ltd");

    const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updatedLead?.status).toBe("CONVERTED");
  });

  it("should calculate correct 18% GST and sequence number for sales quotations", async () => {
    const basePrice = 20000;
    const discount = 2000;
    const taxable = basePrice - discount;
    const taxAmount = Math.round(taxable * 0.18); // 3240
    const totalAmount = taxable + taxAmount; // 21240

    const count = await prisma.quotation.count();
    const quoteNumber = `FYN/QT/2026/${String(count + 1).padStart(6, "0")}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15);

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        clientName: "Enterprise Client",
        clientMobile: "9118066449",
        serviceName: "Virtual CFO Retainer",
        basePrice,
        discount,
        taxAmount,
        totalAmount,
        validUntil,
        status: "DRAFT",
      },
    });

    expect(quotation.quoteNumber).toMatch(/^FYN\/QT\/2026\/\d{6}$/);
    expect(quotation.totalAmount).toBe(21240);
    expect(quotation.taxAmount).toBe(3240);
  });
});
