import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "invoice:read-all");

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: { include: { user: { select: { fullName: true, email: true, mobile: true } } } },
        order: { select: { orderNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { invoiceDate: "desc" },
      take: 100,
    });

    return apiSuccess(invoices);
  } catch (error) {
    return handleApiError(error);
  }
}
