import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const rules = await prisma.complianceRule.findMany({
      orderBy: { name: "asc" },
    });

    return apiSuccess(rules);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const body = await req.json();
    const { name, code, category, frequency, dayOfMonthDue, statutoryPenalty, applicableBusinessType } = body;

    const rule = await prisma.complianceRule.create({
      data: {
        name,
        code,
        category,
        frequency: frequency || "MONTHLY",
        dayOfMonthDue: dayOfMonthDue ? parseInt(dayOfMonthDue) : null,
        statutoryPenalty: statutoryPenalty || null,
        applicableBusinessType: applicableBusinessType || "ALL",
      },
    });

    return apiSuccess(rule, "Compliance rule created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
