import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { assertOrderAccess, sanitizeOrderForCustomer } from "@/lib/rbac/isolation";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      throw new Error("Customer profile not found");
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        package: true,
        steps: { orderBy: { stepNumber: "asc" } },
        documents: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        assignedExpert: { select: { id: true, qualification: true, experienceYears: true, rating: true } },
        messages: {
          where: { isInternalOnly: false }, // Strictly exclude internal notes from database query
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { fullName: true, role: true } } },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    assertOrderAccess(session, { customerId: order.customerId });

    const sanitized = sanitizeOrderForCustomer(order);

    return apiSuccess(sanitized);
  } catch (error) {
    return handleApiError(error);
  }
}
