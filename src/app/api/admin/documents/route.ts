import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "document:read-all");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: {
        customer: { include: { user: { select: { fullName: true, email: true, mobile: true } } } },
        order: { select: { orderNumber: true, service: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess(documents);
  } catch (error) {
    return handleApiError(error);
  }
}
