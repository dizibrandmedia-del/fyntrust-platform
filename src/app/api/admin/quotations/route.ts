import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { recordAuditLog } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:read-all");

    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(quotations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:create");

    const body = await req.json();
    const { clientName, clientEmail, clientMobile, businessName, serviceName, scopeDetails, basePrice, discount, validDays, notes } = body;

    if (!clientName || !clientMobile || !serviceName || basePrice === undefined) {
      throw new Error("Missing required quotation parameters");
    }

    const year = new Date().getFullYear();
    const count = await prisma.quotation.count();
    const quoteNumber = `FYN/QT/${year}/${String(count + 1).padStart(6, "0")}`;

    const numBasePrice = parseFloat(basePrice);
    const numDiscount = discount ? parseFloat(discount) : 0;
    const taxable = Math.max(0, numBasePrice - numDiscount);
    const taxAmount = Math.round(taxable * 0.18);
    const totalAmount = taxable + taxAmount;

    const days = validDays ? parseInt(validDays) : 15;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + days);

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        clientName,
        clientEmail: clientEmail || null,
        clientMobile,
        businessName: businessName || null,
        serviceName,
        scopeDetails: scopeDetails || null,
        basePrice: numBasePrice,
        discount: numDiscount,
        taxAmount,
        totalAmount,
        validUntil,
        status: "DRAFT",
        notes: notes || null,
        createdById: session.userId,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Order",
      entityId: quotation.id,
      newValue: { quoteNumber, totalAmount, clientName },
    });

    return apiSuccess(quotation, "Quotation generated successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
