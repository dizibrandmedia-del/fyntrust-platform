import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let expertProfileId = session.expertProfileId;
    if (!expertProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstExp = await prisma.expertProfile.findFirst();
        expertProfileId = firstExp?.id;
      } else {
        throw new ForbiddenError("Expert profile not found");
      }
    }

    if (!expertProfileId) return apiSuccess([]);

    // Find all assigned order customer IDs
    const assignedOrders = await prisma.order.findMany({
      where: { assignedExpertId: expertProfileId },
      select: { customerId: true },
    });

    const customerIds = Array.from(new Set(assignedOrders.map((o) => o.customerId)));

    const records = await prisma.complianceRecord.findMany({
      where: {
        OR: [
          { assignedExpertId: expertProfileId },
          { customerId: { in: customerIds } },
        ],
      },
      include: {
        customer: { select: { businessName: true, user: { select: { fullName: true, mobile: true } } } },
        rule: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return apiSuccess(records);
  } catch (error) {
    return handleApiError(error);
  }
}
