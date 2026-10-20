import { describe, it, expect } from "vitest";
import {
  assertCustomerAccess,
  assertOrderAccess,
  assertDocumentAccess,
  sanitizeOrderForCustomer,
} from "./isolation";
import { UserSession } from "../types/auth";
import { ForbiddenError } from "../errors/app-error";

describe("Strict Data Isolation Foundation", () => {
  const customerA: UserSession = {
    userId: "user-a",
    fullName: "Customer A",
    role: "CUSTOMER",
    customerProfileId: "profile-a",
  };

  const customerB: UserSession = {
    userId: "user-b",
    fullName: "Customer B",
    role: "CUSTOMER",
    customerProfileId: "profile-b",
  };

  const expert1: UserSession = {
    userId: "exp-user-1",
    fullName: "CA Rohit",
    role: "CA_FINANCE_EXPERT",
    expertProfileId: "expert-profile-1",
  };

  const expert2: UserSession = {
    userId: "exp-user-2",
    fullName: "CA Priya",
    role: "CA_FINANCE_EXPERT",
    expertProfileId: "expert-profile-2",
  };

  const admin: UserSession = {
    userId: "admin-user",
    fullName: "Admin",
    role: "ADMIN",
  };

  describe("Customer Boundary Tests", () => {
    it("Customer A should be able to access own customer profile", () => {
      expect(() => assertCustomerAccess(customerA, "profile-a")).not.toThrow();
    });

    it("Customer A MUST NEVER access Customer B profile", () => {
      expect(() => assertCustomerAccess(customerA, "profile-b")).toThrow(ForbiddenError);
    });

    it("Admin should be allowed to access any customer profile", () => {
      expect(() => assertCustomerAccess(admin, "profile-a")).not.toThrow();
      expect(() => assertCustomerAccess(admin, "profile-b")).not.toThrow();
    });
  });

  describe("Order Boundary Tests", () => {
    const orderA = { customerId: "profile-a", assignedExpertId: "expert-profile-1" };
    const orderB = { customerId: "profile-b", assignedExpertId: "expert-profile-2" };

    it("Customer A should access order A but not order B", () => {
      expect(() => assertOrderAccess(customerA, orderA)).not.toThrow();
      expect(() => assertOrderAccess(customerA, orderB)).toThrow(ForbiddenError);
    });

    it("Expert 1 should only access assigned order A and not unassigned order B", () => {
      expect(() => assertOrderAccess(expert1, orderA)).not.toThrow();
      expect(() => assertOrderAccess(expert1, orderB)).toThrow(ForbiddenError);
    });

    it("Expert 2 should access order B and not order A", () => {
      expect(() => assertOrderAccess(expert2, orderB)).not.toThrow();
      expect(() => assertOrderAccess(expert2, orderA)).toThrow(ForbiddenError);
    });
  });

  describe("Document Access & Order Sanitization", () => {
    it("Sanitization must strip internal notes and messages from customer view", () => {
      const rawOrder = {
        id: "order-1",
        orderNumber: "FYN-001",
        customerId: "profile-a",
        messages: [
          { id: "1", message: "Client document uploaded", isInternalOnly: false },
          { id: "2", message: "Private CA internal review note", isInternalOnly: true },
        ],
        steps: [
          { id: "s1", title: "Step 1", notes: "CA private internal notes" },
        ],
        assignedExpert: {
          id: "expert-profile-1",
          qualification: "FCA",
          commissionRate: 70.0,
          panNumber: "ABCDE1234F",
        },
      };

      const sanitized = sanitizeOrderForCustomer(rawOrder);

      // Verify internal message is stripped
      expect(sanitized.messages.length).toBe(1);
      expect(sanitized.messages[0].isInternalOnly).toBe(false);

      // Verify step internal notes are stripped
      expect((sanitized.steps[0] as any).notes).toBeUndefined();

      // Verify expert sensitive data is obfuscated
      expect((sanitized.assignedExpert as any).commissionRate).toBeUndefined();
      expect((sanitized.assignedExpert as any).panNumber).toBeUndefined();
      expect((sanitized.assignedExpert as any).displayName).toBe("Fyntrust Certified Expert");
    });
  });
});
