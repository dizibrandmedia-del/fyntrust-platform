import { z } from "zod";

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email or mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  expectedRole: z.enum(["CLIENT", "ADMIN"]).optional(),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(3, "Email or mobile number is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const customerRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().default("Private Limited"),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const requestOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian mobile number").optional(),
  email: z.string().email("Invalid email address").optional(),
  purpose: z.enum(["LOGIN", "REGISTRATION", "RESET_PASSWORD", "TRANSACTION"]).default("LOGIN"),
}).refine((data) => data.mobile || data.email, {
  message: "Either mobile number or email address is required",
});

export const verifyOtpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  purpose: z.enum(["LOGIN", "REGISTRATION", "RESET_PASSWORD", "TRANSACTION"]).default("LOGIN"),
}).refine((data) => data.mobile || data.email, {
  message: "Either mobile number or email address is required",
});

// ==========================================
// ORDER SCHEMAS
// ==========================================

export const createOrderSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  packageId: z.string().uuid("Invalid package ID").optional(),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(2, "Business type is required"),
  city: z.string().min(2, "City is required"),
  requirementData: z.record(z.any()).optional(),
  totalAmount: z.number().nonnegative(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "ORDER_PLACED",
    "PAYMENT_RECEIVED",
    "DOCUMENTS_PENDING",
    "DOCUMENTS_VERIFIED",
    "EXPERT_ASSIGNED",
    "WORK_IN_PROGRESS",
    "SUBMITTED_FILED",
    "GOVERNMENT_PROCESSING",
    "COMPLETED",
    "CANCELLED",
    "ON_HOLD",
  ]),
  notes: z.string().optional(),
});

export const assignExpertSchema = z.object({
  expertId: z.string().uuid("Invalid expert profile ID"),
  notes: z.string().optional(),
});

// ==========================================
// SERVICE SCHEMAS
// ==========================================

export const createServiceSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().min(3, "Service name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  shortDescription: z.string().min(10, "Short description is required"),
  fullDescription: z.string().min(20, "Full description is required"),
  startingPrice: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  slaDays: z.number().int().positive().default(3),
  department: z.string().default("TAX"),
  expertCategory: z.string().default("CA_FINANCE_EXPERT"),
  whatsIncluded: z.array(z.string()).min(1, "Include at least one deliverable"),
  eligibility: z.array(z.string()).optional(),
  documentsRequired: z.array(z.string()).min(1, "List at least one required document"),
  processSteps: z.array(
    z.object({
      step: z.number().int().positive(),
      title: z.string(),
      desc: z.string(),
    })
  ).min(1, "Include at least one process step"),
  faqs: z.array(
    z.object({
      q: z.string(),
      a: z.string(),
    })
  ).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// ==========================================
// DOCUMENT SCHEMAS
// ==========================================

export const documentUploadMetaSchema = z.object({
  orderId: z.string().uuid().optional(),
  name: z.string().min(2, "Document name is required"),
  category: z.string().default("GENERAL"),
  financialYear: z.string().default("2026-27"),
  fileType: z.string(),
  fileSize: z.number().int().positive(),
});

export const verifyDocumentSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// ==========================================
// CRM LEAD SCHEMAS
// ==========================================

export const createLeadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).transform((val) => val || undefined),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile number"),
  city: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  source: z.string().optional().default("WEBSITE"),
  notes: z.string().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW_LEAD", "CONTACTED", "QUALIFIED", "QUOTATION", "FOLLOW_UP", "PAYMENT", "CONVERTED", "LOST"]),
  notes: z.string().optional(),
  assignedSalesId: z.string().uuid().optional(),
  quoteAmount: z.number().nonnegative().optional(),
});
