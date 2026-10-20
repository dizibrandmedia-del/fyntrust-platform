import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    const invoices = await prisma.invoice.findMany({
      where: { customerId: user.customerProfile.id },
      include: {
        order: { select: { id: true, orderNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { invoiceDate: "desc" },
    });

    return apiSuccess(invoices);
  } catch (error) {
    return handleApiError(error);
  }
}
