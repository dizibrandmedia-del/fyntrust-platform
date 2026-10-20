import { describe, it, expect } from "vitest";
import { hasPermission, assertPermission } from "./guard";
import { UserSession } from "../types/auth";
import { ForbiddenError } from "../errors/app-error";

describe("RBAC Permissions Foundation", () => {
  const superAdminSession: UserSession = {
    userId: "admin-1",
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
  };

  const customerSession: UserSession = {
    userId: "cust-1",
    fullName: "Customer User",
    role: "CUSTOMER",
    customerProfileId: "cust-profile-1",
  };

  const expertSession: UserSession = {
    userId: "exp-1",
    fullName: "CA Partner",
    role: "CA_FINANCE_EXPERT",
    expertProfileId: "exp-profile-1",
  };

  const salesSession: UserSession = {
    userId: "sales-1",
    fullName: "Sales Rep",
    role: "SALES",
  };

  it("SUPER_ADMIN should have universal permission bypass", () => {
    expect(hasPermission(superAdminSession, "user:delete")).toBe(true);
    expect(hasPermission(superAdminSession, "order:assign-expert")).toBe(true);
    expect(hasPermission(superAdminSession, "audit:read")).toBe(true);
    expect(() => assertPermission(superAdminSession, "service:manage")).not.toThrow();
  });

  it("CUSTOMER should have customer permissions only", () => {
    expect(hasPermission(customerSession, "order:read-own")).toBe(true);
    expect(hasPermission(customerSession, "document:upload")).toBe(true);
    expect(hasPermission(customerSession, "order:assign-expert")).toBe(false);
    expect(hasPermission(customerSession, "lead:read-all")).toBe(false);

    expect(() => assertPermission(customerSession, "order:assign-expert")).toThrow(ForbiddenError);
  });

  it("CA_FINANCE_EXPERT should have expert permissions only", () => {
    expect(hasPermission(expertSession, "order:read-assigned")).toBe(true);
    expect(hasPermission(expertSession, "document:verify")).toBe(true);
    expect(hasPermission(expertSession, "order:read-all")).toBe(false);
    expect(hasPermission(expertSession, "user:delete")).toBe(false);
  });

  it("SALES should be able to manage leads and CRM", () => {
    expect(hasPermission(salesSession, "lead:read-all")).toBe(true);
    expect(hasPermission(salesSession, "lead:create")).toBe(true);
    expect(hasPermission(salesSession, "user:assign-role")).toBe(false);
  });
});
