import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import {
  generateCustomerComplianceCalendar,
  seedDefaultComplianceRules,
} from "@/lib/compliance/compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);

    let customerProfileId = session.customerProfileId;
    if (!customerProfileId) {
      if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
        const firstCust = await prisma.customerProfile.findFirst();
        customerProfileId = firstCust?.id;
      } else {
        throw new ForbiddenError("Customer profile not found");
      }
    }

    if (!customerProfileId) return apiSuccess([]);

    // Check if customer has any compliance records yet, if not generate them
    const count = await prisma.complianceRecord.count({
      where: { customerId: customerProfileId },
    });

    if (count === 0) {
      await seedDefaultComplianceRules();
      await generateCustomerComplianceCalendar(customerProfileId);
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const year = searchParams.get("year");

    const where: any = { customerId: customerProfileId };
    if (category && category !== "ALL") where.category = category;
    if (status && status !== "ALL") where.status = status;

    const records = await prisma.complianceRecord.findMany({
      where,
      include: {
        rule: true,
        assignedExpert: { select: { id: true, qualification: true, user: { select: { fullName: true } } } },
      },
      orderBy: { dueDate: "asc" },
    });

    return apiSuccess(records);
  } catch (error) {
    return handleApiError(error);
  }
}
