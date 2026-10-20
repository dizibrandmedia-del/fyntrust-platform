import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/errors/handler";
import { ForbiddenError } from "@/lib/errors/app-error";
import { checkOverdueCompliances, seedDefaultComplianceRules } from "@/lib/compliance/compliance-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const allowed = ["SUPER_ADMIN", "ADMIN", "SALES"];
    if (!allowed.includes(session.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    // Seed default rules if empty
    const ruleCount = await prisma.complianceRule.count();
    if (ruleCount === 0) {
      await seedDefaultComplianceRules();
    }

    // Automatically check overdue items
    await checkOverdueCompliances();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { customer: { businessName: { contains: search } } },
        { customer: { user: { fullName: { contains: search } } } },
      ];
    }

    const records = await prisma.complianceRecord.findMany({
      where,
      include: {
        customer: { select: { businessName: true, user: { select: { fullName: true, mobile: true } } } },
        rule: true,
        assignedExpert: { select: { id: true, qualification: true, user: { select: { fullName: true } } } },
      },
      orderBy: { dueDate: "asc" },
      take: 100,
    });

    const overdueCount = await prisma.complianceRecord.count({ where: { status: "OVERDUE" } });
    const upcomingCount = await prisma.complianceRecord.count({ where: { status: "UPCOMING" } });
    const completedCount = await prisma.complianceRecord.count({ where: { status: "COMPLETED" } });

    return apiSuccess({
      records,
      metrics: {
        overdueCount,
        upcomingCount,
        completedCount,
        totalTracked: records.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
