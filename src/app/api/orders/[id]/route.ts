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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        package: true,
        customer: {
          include: { user: { select: { fullName: true, email: true, mobile: true } } },
        },
        assignedExpert: true,
        steps: { orderBy: { stepNumber: "asc" } },
        documents: true,
        payments: true,
        invoices: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Verify tenant boundary access
    assertOrderAccess(session, {
      customerId: order.customerId,
      assignedExpertId: order.assignedExpertId,
    });

    // Sanitize order details for customers
    const result = session.role === "CUSTOMER" ? sanitizeOrderForCustomer(order) : order;

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
