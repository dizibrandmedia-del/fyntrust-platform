import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";

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

    if (!customerProfileId) {
      return apiSuccess([]);
    }

    const services = await prisma.recurringService.findMany({
      where: { customerId: customerProfileId },
      include: {
        service: true,
        package: true,
        assignedExpert: {
          select: {
            id: true,
            qualification: true,
            user: { select: { fullName: true } },
          },
        },
        billingCycles: { orderBy: { cycleNumber: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(services);
  } catch (error) {
    return handleApiError(error);
  }
}
