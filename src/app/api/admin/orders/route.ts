import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "order:read-all");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { businessName: { contains: search } } },
        { customer: { user: { fullName: { contains: search } } } },
        { customer: { user: { email: { contains: search } } } },
        { customer: { user: { mobile: { contains: search } } } },
        { service: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { include: { user: { select: { fullName: true, email: true, mobile: true } } } },
        service: { select: { name: true, slug: true, department: true } },
        package: { select: { name: true, price: true } },
        assignedExpert: { select: { qualification: true, city: true } },
        invoices: { select: { invoiceNumber: true, totalAmount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return apiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
