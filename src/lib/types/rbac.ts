import { UserRole } from "./auth";

export type Permission =
  // User Management
  | "user:read"
  | "user:create"
  | "user:update"
  | "user:delete"
  | "user:assign-role"
  
  // Orders
  | "order:read-all"
  | "order:read-assigned"
  | "order:read-own"
  | "order:create"
  | "order:update-status"
  | "order:assign-expert"
  | "order:delete"
  
  // Documents
  | "document:read-all"
  | "document:read-assigned"
  | "document:read-own"
  | "document:upload"
  | "document:verify"
  | "document:delete"
  
  // Services & Packages
  | "service:manage"
  | "package:manage"
  
  // CRM & Leads
  | "lead:read-all"
  | "lead:read-assigned"
  | "lead:create"
  | "lead:update"
  | "lead:assign"
  
  // Experts
  | "expert:read-all"
  | "expert:manage"
  | "expert:view-workload"
  
  // Invoices & Payments
  | "payment:read-all"
  | "payment:read-own"
  | "invoice:read-all"
  | "invoice:read-own"
  | "invoice:create"
  
  // Compliance
  | "compliance:read-all"
  | "compliance:read-assigned"
  | "compliance:read-own"
  | "compliance:manage"
  
  // CMS & Content
  | "cms:manage"
  | "city:manage"
  | "blog:manage"
  
  // Audit & System
  | "audit:read"
  | "settings:manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "user:read", "user:create", "user:update", "user:delete", "user:assign-role",
    "order:read-all", "order:create", "order:update-status", "order:assign-expert", "order:delete",
    "document:read-all", "document:upload", "document:verify", "document:delete",
    "service:manage", "package:manage",
    "lead:read-all", "lead:create", "lead:update", "lead:assign",
    "expert:read-all", "expert:manage", "expert:view-workload",
    "payment:read-all", "invoice:read-all", "invoice:create",
    "compliance:read-all", "compliance:manage",
    "cms:manage", "city:manage", "blog:manage",
    "audit:read", "settings:manage",
  ],
  ADMIN: [
    "user:read", "user:create", "user:update",
    "order:read-all", "order:create", "order:update-status", "order:assign-expert",
    "document:read-all", "document:upload", "document:verify",
    "service:manage", "package:manage",
    "lead:read-all", "lead:create", "lead:update", "lead:assign",
    "expert:read-all", "expert:view-workload",
    "payment:read-all", "invoice:read-all", "invoice:create",
    "compliance:read-all", "compliance:manage",
    "cms:manage", "city:manage", "blog:manage",
    "audit:read",
  ],
  SALES: [
    "lead:read-all", "lead:create", "lead:update",
    "service:manage",
    "order:read-all", "order:create",
    "invoice:read-all",
  ],
  CA_FINANCE_EXPERT: [
    "order:read-assigned", "order:update-status",
    "document:read-assigned", "document:upload", "document:verify",
    "compliance:read-assigned", "compliance:manage",
  ],
  ACCOUNTANT: [
    "order:read-assigned", "order:update-status",
    "document:read-assigned", "document:upload",
    "compliance:read-assigned",
  ],
  LEGAL_PARTNER: [
    "order:read-assigned", "order:update-status",
    "document:read-assigned", "document:upload",
  ],
  VIRTUAL_CFO: [
    "order:read-assigned", "order:update-status",
    "document:read-assigned", "document:upload",
    "compliance:read-assigned", "compliance:manage",
  ],
  CUSTOMER: [
    "order:read-own", "order:create",
    "document:read-own", "document:upload",
    "payment:read-own", "invoice:read-own",
    "compliance:read-own",
  ],
};
