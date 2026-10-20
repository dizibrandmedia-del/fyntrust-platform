import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "user:read");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const businessType = searchParams.get("businessType") || "";

    const where: any = {};

    if (city) where.city = city;
    if (businessType) where.businessType = businessType;

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { gstNumber: { contains: search } },
        { panNumber: { contains: search } },
      ];
    }

    const customers = await prisma.customerProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true, isActive: true, createdAt: true } },
        orders: { select: { id: true, orderNumber: true, status: true, totalAmount: true, service: { select: { name: true } } } },
        documents: { select: { id: true, name: true, status: true } },
        invoices: { select: { id: true, invoiceNumber: true, totalAmount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess(customers);
  } catch (error) {
    return handleApiError(error);
  }
}
