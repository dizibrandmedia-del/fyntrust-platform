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
        throw new ForbiddenError("Only assigned experts can access documents");
      }
    }

    if (!expertProfileId) {
      return apiSuccess([]);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const orderId = searchParams.get("orderId") || "";

    const where: any = {
      order: {
        assignedExpertId: expertProfileId,
      },
    };

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        customer: {
          select: {
            businessName: true,
            user: { select: { fullName: true, mobile: true, email: true } },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(documents);
  } catch (error) {
    return handleApiError(error);
  }
}
