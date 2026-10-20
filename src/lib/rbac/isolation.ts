import { UserSession } from "../types/auth";
import { ForbiddenError } from "../errors/app-error";

export function assertCustomerAccess(session: UserSession, targetCustomerId: string): void {
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN" || session.role === "SALES") {
    return;
  }

  if (session.role === "CUSTOMER") {
    if (session.customerProfileId !== targetCustomerId) {
      throw new ForbiddenError("You are not authorized to access another customer's data");
    }
    return;
  }

  throw new ForbiddenError("Insufficient privileges to access this customer record");
}

export function assertOrderAccess(session: UserSession, order: { customerId: string; assignedExpertId?: string | null }): void {
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN" || session.role === "SALES") {
    return;
  }

  if (session.role === "CUSTOMER") {
    if (session.customerProfileId !== order.customerId) {
      throw new ForbiddenError("You can only access your own orders");
    }
    return;
  }

  // Experts / Partners
  const expertRoles = ["CA_FINANCE_EXPERT", "ACCOUNTANT", "LEGAL_PARTNER", "VIRTUAL_CFO"];
  if (expertRoles.includes(session.role)) {
    if (!order.assignedExpertId || order.assignedExpertId !== session.expertProfileId) {
      throw new ForbiddenError("You can only access orders assigned to your expert profile");
    }
    return;
  }

  throw new ForbiddenError("Access to this order is restricted");
}

export function assertDocumentAccess(
  session: UserSession,
  document: { customerId: string; order?: { assignedExpertId?: string | null } | null }
): void {
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
    return;
  }

  if (session.role === "CUSTOMER") {
    if (session.customerProfileId !== document.customerId) {
      throw new ForbiddenError("You can only access your own documents");
    }
    return;
  }

  const expertRoles = ["CA_FINANCE_EXPERT", "ACCOUNTANT", "LEGAL_PARTNER", "VIRTUAL_CFO"];
  if (expertRoles.includes(session.role)) {
    if (!document.order?.assignedExpertId || document.order.assignedExpertId !== session.expertProfileId) {
      throw new ForbiddenError("You can only access documents for orders assigned to you");
    }
    return;
  }

  throw new ForbiddenError("Access to this document is restricted");
}

export function sanitizeOrderForCustomer<T extends Record<string, any>>(order: T): T {
  const sanitized: Record<string, any> = { ...order };

  // 1. Filter out internal messages from customer view
  if (Array.isArray(sanitized.messages)) {
    sanitized.messages = sanitized.messages.filter((msg: any) => !msg.isInternalOnly);
  }

  // 2. Hide internal notes in order steps
  if (Array.isArray(sanitized.steps)) {
    sanitized.steps = sanitized.steps.map((step: any) => {
      const { notes, ...publicStep } = step;
      return publicStep;
    });
  }

  // 3. Obfuscate private expert contact/financial information, presenting generic "Fyntrust Assigned Expert"
  if (sanitized.assignedExpert) {
    sanitized.assignedExpert = {
      id: sanitized.assignedExpert.id,
      qualification: sanitized.assignedExpert.qualification,
      experienceYears: sanitized.assignedExpert.experienceYears,
      rating: sanitized.assignedExpert.rating,
      displayName: "Fyntrust Certified Expert",
    };
  }

  return sanitized as T;
}
