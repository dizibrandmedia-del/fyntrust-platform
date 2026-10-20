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
        throw new ForbiddenError("Only assigned experts can access assigned orders");
      }
    }

    if (!expertProfileId) {
      return apiSuccess([]);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      assignedExpertId: expertProfileId,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { businessName: { contains: search } } },
        { customer: { user: { fullName: { contains: search } } } },
        { service: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            state: true,
            user: { select: { fullName: true, mobile: true, email: true } },
          },
        },
        service: { select: { id: true, name: true, slug: true, slaDays: true } },
        package: { select: { name: true, tier: true } },
        documents: true,
        tasks: true,
        deliverables: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
