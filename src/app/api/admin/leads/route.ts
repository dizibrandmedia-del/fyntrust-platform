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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const salesId = searchParams.get("salesId") || "";

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (source && source !== "ALL") where.source = source;
    if (salesId) where.assignedSalesId = salesId;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, slug: true } },
        assignedSales: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess(leads);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "lead:create");

    const body = await req.json();
    const { name, mobile, email, city, businessName, businessType, serviceId, source, notes, quoteAmount } = body;

    if (!name || !mobile) {
      throw new Error("Lead name and mobile are required");
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        mobile,
        email: email || null,
        city: city || null,
        businessName: businessName || null,
        businessType: businessType || null,
        serviceId: serviceId || null,
        source: source || "WEBSITE",
        status: "NEW_LEAD",
        notes: notes ? JSON.stringify([{ text: notes, addedAt: new Date(), author: session.fullName }]) : null,
        quoteAmount: quoteAmount ? parseFloat(quoteAmount) : null,
        assignedSalesId: session.userId,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      userRole: session.role,
      action: "CREATE",
      entity: "Lead",
      entityId: lead.id,
      newValue: { name, mobile, source },
    });

    return apiSuccess(lead, "Lead created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
