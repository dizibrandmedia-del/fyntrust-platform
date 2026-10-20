import { prisma } from "../db/prisma";

export interface AuditLogParams {
  userId?: string | null;
  userRole?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "ASSIGN" | "STATUS_CHANGE" | "LOGIN" | "EXPORT" | "VERIFY";
  entity: "User" | "Customer" | "Expert" | "Order" | "Service" | "Package" | "Document" | "Payment" | "Invoice" | "Lead" | "Compliance" | "RecurringService" | "Tool";
  entityId?: string | null;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function recordAuditLog(params: AuditLogParams): Promise<void> {
  if (process.env.ENABLE_AUDIT_LOGS === "false") return;

  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userRole: params.userRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Non-blocking error for audit logging, but logged to stderr
    console.error("[AUDIT_LOG_FAILURE]", error);
  }
}
