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

    const { searchParams } = new URL(req.url);
    const financialYear = searchParams.get("financialYear") || "";
    const category = searchParams.get("category") || "";

    const where: any = {
      customerId: user.customerProfile.id,
    };

    if (financialYear) {
      where.financialYear = financialYear;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        order: { select: { id: true, orderNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(documents);
  } catch (error) {
    return handleApiError(error);
  }
}
