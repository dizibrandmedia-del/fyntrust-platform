import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { assertPermission } from "@/lib/rbac/guard";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    assertPermission(session, "audit:read");

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "";
    const entity = searchParams.get("entity") || "";

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (entity && entity !== "ALL") where.entity = entity;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
