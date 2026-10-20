import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";
import { recordAuditLog } from "../security/audit";

describe("Database & Audit Trail Foundation", () => {
  it("should query seeded users and verify relationships", async () => {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@fyntrust.in" },
    });

    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("SUPER_ADMIN");
    expect(admin?.isActive).toBe(true);

    const customer = await prisma.user.findUnique({
      where: { email: "client@aaravtech.com" },
      include: { customerProfile: true },
    });

    expect(customer).not.toBeNull();
    expect(customer?.customerProfile).not.toBeNull();
    expect(customer?.customerProfile?.businessName).toBe("Aarav Technologies Pvt Ltd");
  });

  it("should query seeded services and categories", async () => {
    const categories = await prisma.serviceCategory.findMany();
    expect(categories.length).toBeGreaterThan(0);

    const gstService = await prisma.service.findUnique({
      where: { slug: "gst-registration" },
      include: { packages: true, category: true },
    });

    expect(gstService).not.toBeNull();
    expect(gstService?.startingPrice).toBe(499);
    expect(gstService?.packages.length).toBe(2);
  });

  it("should record structured audit logs", async () => {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@fyntrust.in" },
    });

    await recordAuditLog({
      userId: admin?.id,
      userRole: "SUPER_ADMIN",
      action: "UPDATE",
      entity: "Service",
      entityId: "gst-service-id",
      oldValue: { price: 499 },
      newValue: { price: 599 },
    });

    const log = await prisma.auditLog.findFirst({
      where: { action: "UPDATE", entity: "Service" },
      orderBy: { createdAt: "desc" },
    });

    expect(log).not.toBeNull();
    expect(log?.userRole).toBe("SUPER_ADMIN");
    expect(JSON.parse(log?.newValue || "{}")).toEqual({ price: 599 });
  });
});
